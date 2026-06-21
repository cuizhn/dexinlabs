import { mergeProps, unref, ref, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { u as useHead } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:url';
import 'node:path';
import 'better-sqlite3';
import 'node:crypto';
import 'vue-router';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

function useExercise() {
  function getExercises(courseSlug) {
    const exercises = {
      // 代数课程练习题
      algebra: [
        {
          id: 1,
          // 题目编号
          type: "choice",
          // 题目类型：选择题
          question: "若 $x + 3 = 7$，则 $x$ 的值为？",
          // 题目（含 LaTeX 公式）
          options: ["3", "4", "5", "10"],
          // 选项列表
          correctIndex: 1
          // 正确答案索引：1（即 '4'）
        },
        {
          id: 2,
          // 题目编号
          type: "input",
          // 题目类型：填空题
          question: "解方程 $2x - 6 = 0$，$x$ 的值为？",
          // 题目（含 LaTeX 公式）
          correctAnswer: "3"
          // 正确答案字符串
        }
      ],
      // 几何课程练习题
      geometry: [
        {
          id: 1,
          // 题目编号
          type: "choice",
          // 题目类型：选择题
          question: "两条平行线被第三条直线所截，同位角的关系是？",
          // 题目
          options: ["互补", "相等", "互余", "无关系"],
          // 选项列表
          correctIndex: 1
          // 正确答案索引：1（即 '相等'）
        }
      ]
    };
    return exercises[courseSlug] || [];
  }
  function checkChoice(selectedIndex, correctIndex) {
    return selectedIndex === correctIndex;
  }
  function checkInput(userAnswer, correctAnswer) {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  }
  return {
    getExercises,
    checkChoice,
    checkInput
  };
}
const _sfc_main$2 = {
  __name: "ExerciseQuizChoice",
  __ssrInlineRender: true,
  props: {
    /** 题目文本内容 */
    question: { type: String, required: true },
    /** 选项数组，每个元素为一个选项的文本 */
    options: { type: Array, required: true },
    /** 正确答案的索引（从 0 开始） */
    correctIndex: { type: Number, required: true }
  },
  setup(__props) {
    const props = __props;
    const selected = ref(null);
    const answered = ref(false);
    const optionLabels = ["A", "B", "C", "D"];
    const isCorrect = computed(() => selected.value === props.correctIndex);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "quiz-choice" }, _attrs))} data-v-f56abaf6><p class="quiz-choice__question" data-v-f56abaf6>${ssrInterpolate(__props.question)}</p><div class="quiz-choice__options" data-v-f56abaf6><!--[-->`);
      ssrRenderList(__props.options, (option, index2) => {
        _push(`<button class="${ssrRenderClass([{
          "quiz-choice__option--selected": selected.value === index2,
          "quiz-choice__option--correct": answered.value && index2 === __props.correctIndex,
          "quiz-choice__option--wrong": answered.value && selected.value === index2 && index2 !== __props.correctIndex
        }, "quiz-choice__option"])}"${ssrIncludeBooleanAttr(answered.value) ? " disabled" : ""} data-v-f56abaf6><span class="quiz-choice__label" data-v-f56abaf6>${ssrInterpolate(optionLabels[index2])}</span><span class="quiz-choice__text" data-v-f56abaf6>${ssrInterpolate(option)}</span></button>`);
      });
      _push(`<!--]--></div>`);
      if (selected.value !== null && !answered.value) {
        _push(`<button class="quiz-choice__submit btn btn--primary" data-v-f56abaf6> 提交答案 </button>`);
      } else {
        _push(`<!---->`);
      }
      if (answered.value) {
        _push(`<div class="${ssrRenderClass([isCorrect.value ? "quiz-choice__feedback--correct" : "quiz-choice__feedback--wrong", "quiz-choice__feedback"])}" data-v-f56abaf6>${ssrInterpolate(isCorrect.value ? "回答正确！" : "回答错误，正确答案是 " + optionLabels[__props.correctIndex])}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/QuizChoice.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const QuizChoice = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-f56abaf6"]]);
const _sfc_main$1 = {
  __name: "ExerciseQuizInput",
  __ssrInlineRender: true,
  props: {
    /** 题目文本内容 */
    question: { type: String, required: true },
    /** 正确答案文本 */
    correctAnswer: { type: String, required: true },
    /** 输入框占位提示文字 */
    placeholder: { type: String, default: "请输入答案" }
  },
  setup(__props) {
    const props = __props;
    const userAnswer = ref("");
    const answered = ref(false);
    const isCorrect = computed(
      () => userAnswer.value.trim().toLowerCase() === props.correctAnswer.trim().toLowerCase()
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "quiz-input" }, _attrs))} data-v-7f0d2b30><p class="quiz-input__question" data-v-7f0d2b30>${ssrInterpolate(__props.question)}</p><div class="quiz-input__field" data-v-7f0d2b30><input${ssrRenderAttr("value", userAnswer.value)} class="quiz-input__input"${ssrRenderAttr("placeholder", __props.placeholder)}${ssrIncludeBooleanAttr(answered.value) ? " disabled" : ""} data-v-7f0d2b30>`);
      if (!answered.value) {
        _push(`<button class="quiz-input__submit btn btn--primary"${ssrIncludeBooleanAttr(!userAnswer.value.trim()) ? " disabled" : ""} data-v-7f0d2b30> 提交 </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (answered.value) {
        _push(`<div class="${ssrRenderClass([isCorrect.value ? "quiz-input__feedback--correct" : "quiz-input__feedback--wrong", "quiz-input__feedback"])}" data-v-7f0d2b30>`);
        if (isCorrect.value) {
          _push(`<!--[-->回答正确！<!--]-->`);
        } else {
          _push(`<!--[-->回答错误，正确答案是 ${ssrInterpolate(__props.correctAnswer)}<!--]-->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/QuizInput.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const QuizInput = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-7f0d2b30"]]);
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "练习中心" });
    const { getExercises } = useExercise();
    const exercises = getExercises("algebra");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "practice-page" }, _attrs))} data-v-6c559716><section class="practice-page__header" data-v-6c559716><div class="container container-sm" data-v-6c559716><h1 class="practice-page__title" data-v-6c559716>练习中心</h1><p class="practice-page__description" data-v-6c559716>选择课程，开始练习巩固所学知识</p></div></section><section class="practice-page__content" data-v-6c559716><div class="container" data-v-6c559716><div class="practice-page__grid" data-v-6c559716><!--[-->`);
      ssrRenderList(unref(exercises), (exercise) => {
        _push(`<div class="practice-page__item" data-v-6c559716>`);
        if (exercise.type === "choice") {
          _push(ssrRenderComponent(QuizChoice, {
            question: exercise.question,
            options: exercise.options,
            "correct-index": exercise.correctIndex
          }, null, _parent));
        } else if (exercise.type === "input") {
          _push(ssrRenderComponent(QuizInput, {
            question: exercise.question,
            "correct-answer": exercise.correctAnswer
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div></div></section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/practice/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6c559716"]]);

export { index as default };
//# sourceMappingURL=index-BinQ1QQX.mjs.map
