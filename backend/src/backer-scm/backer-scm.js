import Utils from "../utils/utils.js";
import DBMS from "../dbms/dbms.js";

export default class BackerSCM {
  constructor() {
    // No extend DBMS anymore; instantiate and delegate
    this.dbms = new DBMS();
    this.utils = new Utils();
    // Backup temporal para subsistema/clase/metodo y perfiles de métodos
    this._subsystemsClassesMethodsBackup = null;

    if (!BackerSCM.instance) {
      BackerSCM.instance = this;
    }

    return BackerSCM.instance;
  }

  // Backup en orden inverso: primero method_profile, luego method, class y subsystem
  async backupSubsystemsClassesMethodsReverseOrder() {
    return await this._withTransaction(async (client) => {
      const methodProfilesRes = await client.query(`
        SELECT mp.id_method, mp.id_profile
        FROM public."method_profile" mp;`);
      const methodsRes = await client.query(`
        SELECT m.id, m.name, m.description
        FROM public."method" m;`);
      const classesRes = await client.query(`
        SELECT c.id, c.name, c.description
        FROM public."class" c;`);
      const subsystemsRes = await client.query(`
        SELECT s.id, s.name, s.description
        FROM public."subsystem" s;`);
      const classMethodRes = await client.query(`
        SELECT cm.id_class, cm.id_method FROM public."class_method" cm;`);
      const subsystemClassRes = await client.query(`
        SELECT sc.id_subsystem, sc.id_class FROM public."subsystem_class" sc;`);
      // Guardar estructura para poder restaurar
      this._subsystemsClassesMethodsBackup = {
        methodProfiles: methodProfilesRes.rows,
        methods: methodsRes.rows,
        classes: classesRes.rows,
        subsystems: subsystemsRes.rows,
        classMethods: classMethodRes.rows,
        subsystemClasses: subsystemClassRes.rows,
      };
      return { message: 'Copia de seguridad creada correctamente' };
    }, 'Error creating backup subsystems/classes/methods');
  }

  // Realiza backup, elimina tablas dependientes, setea MenusOptionsProfiles y restaura subsistemas/clases/métodos y method_profiles
  async resetMenusAndRestoreSubsystemsClassesMethods(
    menusProfilesData,
    subsystemsClassesMethodsData
  ) {
    // Crear backup primero
    await this.backupSubsystemsClassesMethodsReverseOrder();
    if (!this._subsystemsClassesMethodsBackup)
      return this.utils.handleError({
        message: 'No se pudo crear el backup previo',
        errorCode: this.ERROR_CODES.INTERNAL_SERVER_ERROR,
      });

    return await this._withTransaction(async (client) => {
      // Eliminar en orden que evita FKs (method_profile -> class_method -> subsystem_class -> transaction -> method -> class -> subsystem)
      await client.query('DELETE FROM public."method_profile";');
      await client.query('DELETE FROM public."class_method";');
      await client.query('DELETE FROM public."subsystem_class";');
      await client.query('DELETE FROM public."transaction";');
      await client.query('DELETE FROM public."method";');
      await client.query('DELETE FROM public."class";');
      await client.query('DELETE FROM public."subsystem";');

      // Opcionalmente limpiar menús/opciones antes de recrearlos
      await client.query('DELETE FROM public."option_menu";');
      await client.query('DELETE FROM public."option_profile";');
      await client.query('DELETE FROM public."menu";');
      await client.query('DELETE FROM public."option";');

      // Insertar MenusOptionsProfiles con API existente (fuera de esta transacción para reutilizar ensure) usando la misma conexión
      // Reimplementamos internamente parte de setMenusOptionsProfiles para usar este client sin nueva transacción
      const processMenusStructure = async (data) => {
        const isShape = this._isMenusStructureShape(data);
        if (isShape) {
          for (const subsystem of Object.keys(data)) {
            const menusLevel1 = Object.keys(data[subsystem] || {});
            for (const menuName of menusLevel1) {
              const menuNode = data[subsystem][menuName];
              const menu1Id = await this._ensureEntityByUniqueField(
                client,
                'menu',
                {
                  name: menuName,
                  description: menuNode?.description || menuName,
                }
              );
              const traverse = async (parentId, node) => {
                const submenus = Object.keys(node?.submenus || {});
                for (const submenuName of submenus) {
                  const submenuNode = node.submenus[submenuName];
                  const submenuId = await this._ensureEntityByUniqueField(
                    client,
                    'menu',
                    {
                      name: submenuName,
                      description: submenuNode?.description || submenuName,
                      ...(parentId ? { id_parent: parentId } : {}),
                    }
                  );
                  const options = Object.keys(submenuNode?.options || {});
                  for (const optionName of options) {
                    const optionNode = submenuNode.options[optionName];
                    const optionId = await this._ensureEntityByUniqueField(
                      client,
                      'option',
                      {
                        name: optionName,
                        description: optionNode?.description || optionName,
                      }
                    );
                    await this._ensureJoin(client, 'option_menu', {
                      id_menu: submenuId,
                      id_option: optionId,
                    });
                    for (const prof of optionNode?.allowedProfiles || []) {
                      const profileId = await this._ensureEntityByUniqueField(
                        client,
                        'profile',
                        { name: prof }
                      );
                      await this._ensureJoin(client, 'option_profile', {
                        id_option: optionId,
                        id_profile: profileId,
                      });
                    }
                  }
                  await traverse(submenuId, submenuNode);
                }
                const optionsHere = Object.keys(node?.options || {});
                for (const optionName of optionsHere) {
                  const optionNode = node.options[optionName];
                  const optionId = await this._ensureEntityByUniqueField(
                    client,
                    'option',
                    {
                      name: optionName,
                      description: optionNode?.description || optionName,
                    }
                  );
                  await this._ensureJoin(client, 'option_menu', {
                    id_menu: parentId || menu1Id,
                    id_option: optionId,
                  });
                  for (const prof of optionNode?.allowedProfiles || []) {
                    const profileId = await this._ensureEntityByUniqueField(
                      client,
                      'profile',
                      { name: prof }
                    );
                    await this._ensureJoin(client, 'option_profile', {
                      id_option: optionId,
                      id_profile: profileId,
                    });
                  }
                }
              };
              await traverse(menu1Id, menuNode);
            }
          }
        } else {
          for (const profile of Object.keys(data || {})) {
            const menusData = data[profile];
            for (const menu of Object.keys(menusData || {})) {
              const arrOptions = menusData[menu];
              const menuId = await this._ensureEntityByUniqueField(
                client,
                'menu',
                { name: menu }
              );
              for (const option of arrOptions || []) {
                const optionId = await this._ensureEntityByUniqueField(
                  client,
                  'option',
                  { name: option }
                );
                await this._ensureJoin(client, 'option_menu', {
                  id_menu: menuId,
                  id_option: optionId,
                });
                const profileId = await this._ensureEntityByUniqueField(
                  client,
                  'profile',
                  { name: profile }
                );
                await this._ensureJoin(client, 'option_profile', {
                  id_option: optionId,
                  id_profile: profileId,
                });
              }
            }
          }
        }
      };
      await processMenusStructure(menusProfilesData || {});

      // Restaurar subsystems/classes/methods y relaciones
      // Si se proporciona subsystemsClassesMethodsData usarlo; si no usar backup
      const restoreData =
        subsystemsClassesMethodsData || this._subsystemsClassesMethodsBackup;
      if (!restoreData)
        return this.utils.handleError({
          message: 'No hay datos para restaurar subsistemas/clases/métodos',
          errorCode: this.ERROR_CODES.BAD_REQUEST,
        });

      // Primero insertar subsystems
      const subsystemIdMap = {};
      for (const s of restoreData.subsystems || []) {
        const sId = await this._ensureEntityByUniqueField(client, 'subsystem', {
          name: s.name,
          description: s.description || s.name,
        });
        subsystemIdMap[s.id] = sId;
      }
      // Luego classes
      const classIdMap = {};
      for (const c of restoreData.classes || []) {
        const cId = await this._ensureEntityByUniqueField(client, 'class', {
          name: c.name,
          description: c.description || c.name,
        });
        classIdMap[c.id] = cId;
      }
      // Luego methods
      const methodIdMap = {};
      for (const m of restoreData.methods || []) {
        const mId = await this._ensureEntityByUniqueField(client, 'method', {
          name: m.name,
          description: m.description || m.name,
        });
        methodIdMap[m.id] = mId;
      }
      // Relaciones subsystem_class
      for (const sc of restoreData.subsystemClasses || []) {
        const newSubsystemId = subsystemIdMap[sc.id_subsystem];
        const newClassId = classIdMap[sc.id_class];
        if (newSubsystemId && newClassId) {
          await this._ensureJoin(client, 'subsystem_class', {
            id_subsystem: newSubsystemId,
            id_class: newClassId,
          });
        }
      }
      // Relaciones class_method
      for (const cm of restoreData.classMethods || []) {
        const newClassId = classIdMap[cm.id_class];
        const newMethodId = methodIdMap[cm.id_method];
        if (newClassId && newMethodId) {
          await this._ensureJoin(client, 'class_method', {
            id_class: newClassId,
            id_method: newMethodId,
          });
        }
      }
      // method_profile
      for (const mp of restoreData.methodProfiles || []) {
        const newMethodId = methodIdMap[mp.id_method];
        if (newMethodId) {
          await this._ensureJoin(client, 'method_profile', {
            id_method: newMethodId,
            id_profile: mp.id_profile,
          });
        }
      }
      // Restaurar transactions
      for (const m of restoreData.methods || []) {
        // reconstruimos tx = subsystem.class.method si se puede
        const relatedClass = restoreData.classMethods.find(
          (cm) => cm.id_method === m.id
        );
        if (relatedClass) {
          const relatedSubsystem = restoreData.subsystemClasses.find(
            (sc) => sc.id_class === relatedClass.id_class
          );
          if (relatedSubsystem) {
            const txKey = `${restoreData.subsystems.find((s) => s.id === relatedSubsystem.id_subsystem)?.name}.${restoreData.classes.find((c) => c.id === relatedClass.id_class)?.name}.${m.name}`;
            const newSubsystemId =
              subsystemIdMap[relatedSubsystem.id_subsystem];
            const newClassId = classIdMap[relatedClass.id_class];
            const newMethodId = methodIdMap[m.id];
            if (newSubsystemId && newClassId && newMethodId) {
              const txCheckRes = await client.query(
                'SELECT id FROM public."transaction" WHERE id_subsystem = $1 AND id_class = $2 AND id_method = $3 LIMIT 1;',
                [newSubsystemId, newClassId, newMethodId]
              );
              if (!txCheckRes.rows || txCheckRes.rows.length === 0) {
                // Insert transaction without forcing the tx column (serial PK).
                // Use SELECT-before-INSERT semantics already above; still guard against races.
                try {
                  await client.query(
                    'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
                    [
                      m.description || txKey,
                      newSubsystemId,
                      newClassId,
                      newMethodId,
                    ]
                  );
                } catch (e) {
                  // If another session inserted the same transaction concurrently, ignore duplicate-key and continue
                  if (e && e.code === '23505') {
                    // noop - already created by concurrent process
                  } else {
                    throw e;
                  }
                }
              }
            }
          }
        }
      }
      // Actualizar id_subsystem en menú si la entrada tiene forma de subsystems con menus asociados
      const hasSubsystemMenus = (obj) =>
        obj &&
        typeof obj === 'object' &&
        Object.values(obj).some(
          (v) => v && typeof v === 'object' && (v.menus || v.classes)
        );
      if (
        hasSubsystemMenus(subsystemsClassesMethodsData) &&
        subsystemsClassesMethodsData
      ) {
        for (const subsystemName of Object.keys(subsystemsClassesMethodsData)) {
          const subsystemOrig = restoreData.subsystems.find(
            (s) => s.name === subsystemName
          );
          if (!subsystemOrig) continue;
          const newSubsystemId = subsystemIdMap[subsystemOrig.id];
          if (!newSubsystemId) continue;
          const menusObj =
            subsystemsClassesMethodsData[subsystemName].menus || {};
          for (const menuName of Object.keys(menusObj)) {
            await client.query(
              'UPDATE public."menu" SET id_subsystem = $1 WHERE name = $2;',
              [newSubsystemId, menuName]
            );
          }
        }
      }
      return {
        message:
          'Menús reestablecidos y subsistemas/clases/métodos restaurados correctamente',
      };
    }, 'Error al restablecer menús y restaurar subsistemas/clases/métodos');
  }
}
