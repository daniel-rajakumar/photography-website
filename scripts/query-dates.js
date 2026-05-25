import {getCliClient} from "sanity/cli"; 
async function run() { 
  const c = getCliClient(); 
  const docs = await c.fetch(`*[_type=="photo"]{filename, "exifDate": image.asset->metadata.exif.DateTimeOriginal, "sysDate": date}`); 
  console.log(JSON.stringify(docs, null, 2)); 
} 
run();
