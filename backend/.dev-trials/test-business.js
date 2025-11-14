import Business from '#business/business.js';

const testBusiness = async () => {
  const business = new Business();
  business.mapFolderSync('./src/business/atx');
  console.log(business.getMappedFilenames());
};
testBusiness();
