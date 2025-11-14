import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Popup({
  profiles,
  setProfileSelected,
}: {
  profiles: string[];
  setProfileSelected: (v: string) => void;
}) {
  return (
    <div className='w-full h-full bg-(--gray-background-translucent-light) absolute justify-center items-center flex '>
      <div className='flex flex-col bg-(--gray-background) w-100 h-55 rounded-lg p-6 gap-10 justify-center items-center shadow-[0_0_30px_var(--primary-color-translucent)]'>
        <h1 className='text-lg font-bold text-foreground'>
          Seleccione a continuación su perfil:
        </h1>
        <Select onValueChange={setProfileSelected}>
          <SelectTrigger className='min-w-[200px] capitalize'>
            <SelectValue placeholder='Seleccione un perfil' />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => (
              <SelectItem key={profile} value={profile} className='capitalize'>
                {profile}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
