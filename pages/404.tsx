import { useRouter } from "next/router"

export default function Custom404() {
  const { asPath, query } = useRouter()
  return <div>404 - Path: {asPath}</div>
}
