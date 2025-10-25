export const competenceColors = {
    UE1: {
        color: "bg-blue-50 border-blue-200 text-blue-900",
        bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
    },
    UE2: {
        color: "bg-emerald-50 border-emerald-200 text-emerald-900",
        bgGradient: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    },
    UE3: {
        color: "bg-purple-50 border-purple-200 text-purple-900",
        bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100",
    },
    UE4: {
        color: "bg-orange-50 border-orange-200 text-orange-900",
        bgGradient: "bg-gradient-to-br from-orange-50 to-orange-100",
    },
    UE5: {
        color: "bg-pink-50 border-pink-200 text-pink-900",
        bgGradient: "bg-gradient-to-br from-pink-50 to-pink-100",
    },
} as const;

export type CompetenceColorKey = keyof typeof competenceColors;
