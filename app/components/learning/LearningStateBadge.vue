<template>
  <span
    class="inline-flex items-center gap-[6px] px-3 py-1 rounded-md text-[0.8125rem] font-medium leading-none"
    :class="badgeClass"
  >
    <span class="w-[6px] h-[6px] rounded-full flex-shrink-0" :class="dotClass"></span>
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { LearningState, useLearningState } from '~/composables/useLearningState'

const props = defineProps<{
  state: LearningState
}>()

const { getStateLabel } = useLearningState()

const label = computed(() => getStateLabel(props.state))

const badgeClass = computed(() => {
  switch (props.state) {
    case LearningState.NOT_STARTED:
      return 'bg-bg-secondary text-text-secondary'
    case LearningState.IN_PROGRESS:
      return 'bg-[rgba(79,70,229,0.08)] text-primary'
    case LearningState.MASTERED:
      return 'bg-[rgba(34,197,94,0.08)] text-[#16a34a]'
    default:
      return 'bg-bg-secondary text-text-secondary'
  }
})

const dotClass = computed(() => {
  switch (props.state) {
    case LearningState.NOT_STARTED:
      return 'bg-text-light'
    case LearningState.IN_PROGRESS:
      return 'bg-primary'
    case LearningState.MASTERED:
      return 'bg-[#16a34a]'
    default:
      return 'bg-text-light'
  }
})
</script>
