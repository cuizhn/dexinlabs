<template>
<div :class="wrapperClass">

    <slot name="header" />

    <div class="body">

        <slot name="body-start"/>

        <div
            v-if="html"
            class="content"
            v-html="html"
        />

        <slot
            v-else
            name="empty"
        />

        <slot name="body-end"/>

    </div>

    <slot name="footer"/>

</div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    html?: string
    theme?: string
  }>(),
  {
    html: '',
    theme: 'default'
  }
)

const wrapperClass = computed(() => [
  'renderer',
  `theme-${props.theme}`
])
</script>

<style scoped>
@import "./styles/typography.css";
@import "./styles/math.css";

.renderer {
  color: inherit;
}

.body {
  line-height: 1.8;
}
</style>