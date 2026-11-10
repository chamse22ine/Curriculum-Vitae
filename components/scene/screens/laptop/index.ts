import type { ScreenApp } from "../types"
import { appCI } from "./ci"
import { appCode } from "./code"
import { appContact } from "./contact"
import { appGit } from "./git"
import { appNotebook } from "./notebook"
import { appProjects } from "./projects"
import { appShop } from "./shop"
import { appTrain } from "./train"

/** Une app par section, dans l'ordre de content/sections.ts */
export const LAPTOP_APPS: readonly ScreenApp[] = [appCode, appShop, appNotebook, appTrain, appCI, appProjects, appGit, appContact]
