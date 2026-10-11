export const odOptions = [
  'OD1',
  'OD1/Bonus1',
  'OD2',
  'OD2/Bonus1',
  'OD2/Bonus2',
  'OD3',
  'OD3/Bonus1',
  'OD3/Bonus2',
  'OD3/Bonus3',
  'OD4',
  'OD4/Bonus1',
  'OD4/Bonus2',
  'OD4/Bonus3',
  'OD5',
  'OD5/Bonus1',
  'OD5/Bonus2',
  'OD5/Bonus3',
]

export const maxBonusByOdLevel = odOptions.reduce((maxBonusMap, option) => {
  const matched = option.match(/^OD(\d+)\/Bonus(\d+)$/)
  if (!matched) return maxBonusMap

  const odLevel = Number(matched[1])
  const bonusNumber = Number(matched[2])
  if (!maxBonusMap[odLevel] || bonusNumber > maxBonusMap[odLevel]) {
    maxBonusMap[odLevel] = bonusNumber
  }
  return maxBonusMap
}, {})

export function getOdLevel(od) {
  const matched = typeof od === 'string' ? od.match(/^OD\d+/) : null
  return matched ? matched[0] : null
}
