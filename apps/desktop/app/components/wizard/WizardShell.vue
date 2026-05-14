<script setup lang="ts">
const wizard = useWizardStore()

const stepLabels = ['Select Folder', 'Code Editor', 'AI Tool']
</script>

<template>
  <div class="flex flex-col min-h-[480px]">
    <!-- Progress -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-3">
        <div
          v-for="(label, i) in stepLabels"
          :key="i"
          class="flex items-center gap-2 flex-1"
        >
          <div
            class="size-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0"
            :class="[
              i < wizard.currentStep
                ? 'bg-indigo-500 text-white'
                : i === wizard.currentStep
                  ? 'bg-indigo-500/30 border-2 border-indigo-500 text-indigo-300'
                  : 'bg-white/10 text-white/30',
            ]"
          >
            <svg v-if="i < wizard.currentStep" class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span
            class="text-xs transition-colors hidden sm:block"
            :class="i === wizard.currentStep ? 'text-white/80' : 'text-white/30'"
          >
            {{ label }}
          </span>
          <div
            v-if="i < stepLabels.length - 1"
            class="flex-1 h-px transition-colors"
            :class="i < wizard.currentStep ? 'bg-indigo-500/60' : 'bg-white/10'"
          />
        </div>
      </div>
    </div>

    <!-- Step content -->
    <div class="flex-1">
      <StepDirectory v-if="wizard.currentStep === 0" />
      <StepEditor v-else-if="wizard.currentStep === 1" />
      <StepAITool v-else-if="wizard.currentStep === 2" />
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
      <GlassButton
        v-if="!wizard.isFirstStep"
        variant="ghost"
        @click="wizard.back()"
      >
        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back
      </GlassButton>
      <div v-else />

      <GlassButton
        :disabled="!wizard.canProceed"
        @click="wizard.isLastStep ? $emit('finish') : wizard.next()"
      >
        {{ wizard.isLastStep ? 'Create Project' : 'Continue' }}
        <svg v-if="!wizard.isLastStep" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </GlassButton>
    </div>
  </div>
</template>
