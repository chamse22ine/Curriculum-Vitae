import type { ScreenApp } from "../types"
import { pCard } from "./card"
import { pChat } from "./chat"
import { pHome } from "./home"
import { pHours } from "./hours"
import { pKpi } from "./kpi"
import { pNotif } from "./notif"
import { pQuiz } from "./quiz"
import { pShop } from "./shop"

/** Une app par section, dans l'ordre de content/sections.ts */
export const PHONE_APPS: readonly ScreenApp[] = [pHome, pShop, pKpi, pChat, pNotif, pQuiz, pHours, pCard]
