"use client"

import { useEffect, useMemo, type Ref } from "react"
import { Group, Mesh, type Texture } from "three"
import { rplane, slab } from "./geometry"
import { glass, type Materials } from "./materials"

function buildPhone(mats: Materials, screen: Texture) {
  const phone = new Group()
  const bodyGeo = slab(0.8, 1.62, 0.07, 0.13)
  phone.add(new Mesh(bodyGeo, mats.TITAN))
  const screenGeo = rplane(0.74, 1.56, 0.11)
  const screenMat = glass(screen)
  const pscr = new Mesh(screenGeo, screenMat)
  pscr.position.z = 0.0485
  phone.add(pscr)
  return {
    group: phone,
    dispose() {
      bodyGeo.dispose()
      screenGeo.dispose()
      screenMat.dispose()
    },
  }
}

/** Téléphone en titane ; la scène pilote sa position via la ref du groupe */
export function Phone({ materials, screen, ref }: Readonly<{ materials: Materials; screen: Texture; ref: Ref<Group> }>) {
  const phone = useMemo(() => buildPhone(materials, screen), [materials, screen])
  useEffect(() => () => phone.dispose(), [phone])
  return <primitive ref={ref} object={phone.group} />
}
