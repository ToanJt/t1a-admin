import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface projectDataType {
  name: string;
  description: string | null;
  client: string | null;
  year: number | null;
  type: string | null;
  size: string | null;
  is360: boolean;
  link360: string | null;
  images: Array<string>;
}

async function createProject(data: projectDataType) {
  const projectData = {
    name: data.name,
    description: data.description,
    client: data.client,
    year: data.year,
    type: data.type,
    size: data.size,
    is360: data.is360,
    link360: data.link360,
    images: data.images,
  };
  try {
    const newProject = doc(collection(db, "projects/"));
    await setDoc(newProject, projectData);
  } catch (error) {
    console.log("Failed create project!! " + error);
  }
}

export { createProject };
