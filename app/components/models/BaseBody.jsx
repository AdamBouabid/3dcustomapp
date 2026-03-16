import { useGLTF } from "@react-three/drei";

export default function BaseBody({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}