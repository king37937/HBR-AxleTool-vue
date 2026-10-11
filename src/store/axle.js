import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { compressToUTF16, decompressFromUTF16 } from 'lz-string'
import { cloneDeep } from 'lodash-es'
import { maxBonusByOdLevel } from '@/utils/axle/odOptions'

function createEmptySkillEntry() {
  return {
    selectedTab: null,
    style: null,
    style_id: null,
    activeFormId: null,
    style_img: null,
    skill: null,
    target: null,
    is1Damage: false,
  }
}

function createEmptySkillRow() {
  return [createEmptySkillEntry(), createEmptySkillEntry(), createEmptySkillEntry()]
}

function getNextTurnValue(previousTurn, newRowNumber, keepsTurnNumber = false) {
  const matched = typeof previousTurn === 'string' ? previousTurn.match(/^T(\d+)$/) : null
  if (keepsTurnNumber && matched) return previousTurn

  const nextTurnNumber = matched ? Number(matched[1]) + 1 : newRowNumber
  return `T${nextTurnNumber}`
}

function getNextOdValue(previousOd) {
  const matched = typeof previousOd === 'string' ? previousOd.match(/^OD(\d+)\/Bonus(\d+)$/) : null
  if (!matched) return null

  const odLevel = Number(matched[1])
  const nextBonusNumber = Number(matched[2]) + 1
  const maxBonusNumber = maxBonusByOdLevel[odLevel]
  return maxBonusNumber && nextBonusNumber <= maxBonusNumber ? `OD${odLevel}/Bonus${nextBonusNumber}` : null
}

export const useSkillStore = defineStore(
  'skill',
  () => {
    const axleName = ref('')
    const axleId = ref('')
    const skills = ref([])
    const turns = ref([])

    function adjustSkills(rows) {
      const difference = rows - skills.value.length

      if (difference > 0) {
        const newSkills = Array.from({ length: difference }, createEmptySkillRow)
        skills.value.push(...newSkills)

        const newTurns = Array.from({ length: difference }, () => ({ id: uuidv4(), turn: null, od: null }))
        turns.value.push(...newTurns)
      } else if (difference < 0) {
        skills.value.splice(rows)
        turns.value.splice(rows)
      }
    }

    function addRow() {
      const previousSkills = skills.value[skills.value.length - 1]
      const previousTurn = turns.value[turns.value.length - 1]
      const od = getNextOdValue(previousTurn?.od)

      skills.value.push(previousSkills ? cloneDeep(previousSkills) : createEmptySkillRow())
      turns.value.push({
        id: uuidv4(),
        turn: getNextTurnValue(previousTurn?.turn, skills.value.length, od !== null),
        od,
      })
    }

    function ensureIds() {
      turns.value.forEach((turn) => {
        if (!turn.id) {
          turn.id = uuidv4()
        }
      })
    }

    function resetCurrentAxle() {
      axleName.value = ''
      axleId.value = ''
      skills.value = []
      turns.value = []
    }

    return {
      axleName,
      axleId,
      skills,
      turns,
      addRow,
      adjustSkills,
      ensureIds,
      resetCurrentAxle,
    }
  },
  {
    persist: {
      storage: localStorage,
      serializer: {
        serialize: (state) => {
          const jsonString = JSON.stringify(state)
          return compressToUTF16(jsonString)
        },
        deserialize: (compressedString) => {
          const jsonString = decompressFromUTF16(compressedString)
          return jsonString ? JSON.parse(jsonString) : {}
        },
      },
    },
  },
)
