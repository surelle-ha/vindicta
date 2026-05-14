<script setup lang="ts">
withDefaults(defineProps<{
  accent?: string
}>(), {
  accent: '#a78bfa',
})
</script>

<template>
  <div class="guide-orb" aria-hidden="true">
    <div class="guide-orb__nebula" :style="{ background: `radial-gradient(ellipse at 50% 32%, ${accent}3D 0%, transparent 68%)` }" />

    <div class="guide-orb__rings guide-orb__rings--back">
      <svg class="guide-orb__ring guide-orb__ring--4" viewBox="0 0 124 32">
        <path d="M 1,16 A 61,15 0 0,1 123,16" fill="none" :stroke="accent + '14'" stroke-width="1" />
      </svg>
      <svg class="guide-orb__ring guide-orb__ring--3" viewBox="0 0 102 26">
        <path d="M 1,13 A 50,12 0 0,1 101,13" fill="none" :stroke="accent + '2C'" stroke-width="1" />
      </svg>
      <svg class="guide-orb__ring guide-orb__ring--2" viewBox="0 0 78 20">
        <path d="M 1,10 A 38,9 0 0,1 77,10" fill="none" :stroke="accent + '50'" stroke-width="1.4" />
      </svg>
      <svg class="guide-orb__ring guide-orb__ring--1" viewBox="0 0 56 14">
        <path d="M 1,7 A 27,6 0 0,1 55,7" fill="none" :stroke="accent + '8F'" stroke-width="1.8" :style="{ filter: `drop-shadow(0 0 5px ${accent}88)` }" />
      </svg>
      <div class="guide-orb__disc guide-orb__disc--back" :style="{ background: `radial-gradient(ellipse, ${accent}24 0%, transparent 68%)` }" />
    </div>

    <div class="guide-orb__sphere">
      <div class="guide-orb__outer" :style="{ background: `radial-gradient(circle, ${accent}42 0%, transparent 68%)` }" />
      <div class="guide-orb__lens" :style="{ borderColor: accent + '75', boxShadow: `inset 0 0 16px ${accent}33, 0 0 20px ${accent}44` }" />
      <div class="guide-orb__body" :style="{ background: `radial-gradient(circle at 30% 26%, rgba(255,255,255,0.92) 0%, ${accent}BD 21%, #312e81 58%, #111025 100%)` }" />
      <div class="guide-orb__shine" :style="{ background: `radial-gradient(circle at 28% 26%, ${accent}3D 0%, transparent 56%)` }" />
    </div>

    <div class="guide-orb__rings guide-orb__rings--front">
      <svg class="guide-orb__ring guide-orb__ring--4" viewBox="0 0 124 32">
        <path d="M 1,16 A 61,15 0 0,0 123,16" fill="none" :stroke="accent + '16'" stroke-width="1" />
      </svg>
      <svg class="guide-orb__ring guide-orb__ring--3" viewBox="0 0 102 26">
        <path d="M 1,13 A 50,12 0 0,0 101,13" fill="none" :stroke="accent + '38'" stroke-width="1" />
      </svg>
      <svg class="guide-orb__ring guide-orb__ring--2" viewBox="0 0 78 20">
        <path d="M 1,10 A 38,9 0 0,0 77,10" fill="none" :stroke="accent + '68'" stroke-width="1.5" />
      </svg>
      <svg class="guide-orb__ring guide-orb__ring--1" viewBox="0 0 56 14">
        <path d="M 1,7 A 27,6 0 0,0 55,7" fill="none" :stroke="accent + 'C7'" stroke-width="2.2" :style="{ filter: `drop-shadow(0 0 6px ${accent}A6)` }" />
      </svg>
      <div class="guide-orb__disc guide-orb__disc--front" :style="{ background: `radial-gradient(ellipse, ${accent}30 0%, transparent 70%)` }" />
      <span class="guide-orb__particle guide-orb__particle--1" :style="{ background: accent }" />
      <span class="guide-orb__particle guide-orb__particle--2" :style="{ background: accent }" />
    </div>
  </div>
</template>

<style scoped>
.guide-orb {
  position: relative;
  width: 68px;
  height: 68px;
  isolation: isolate;
}

.guide-orb__nebula {
  position: absolute;
  inset: -12px -22px;
  border-radius: 9999px;
  opacity: 0.9;
  filter: blur(2px);
}

.guide-orb__rings {
  position: absolute;
  top: 34px;
  left: 50%;
  width: 1px;
  height: 1px;
  pointer-events: none;
  transform: translateX(-50%);
}

.guide-orb__rings--back {
  z-index: 1;
}

.guide-orb__rings--front {
  z-index: 4;
}

.guide-orb__ring {
  position: absolute;
  overflow: visible;
  animation: orb-ring-drift 5.5s ease-in-out infinite;
}

.guide-orb__ring--4 {
  width: 124px;
  height: 32px;
  margin-left: -62px;
  margin-top: -16px;
  filter: blur(0.8px);
}

.guide-orb__ring--3 {
  width: 102px;
  height: 26px;
  margin-left: -51px;
  margin-top: -13px;
  animation-delay: -0.4s;
  filter: blur(0.35px);
}

.guide-orb__ring--2 {
  width: 78px;
  height: 20px;
  margin-left: -39px;
  margin-top: -10px;
  animation-delay: -0.8s;
}

.guide-orb__ring--1 {
  width: 56px;
  height: 14px;
  margin-left: -28px;
  margin-top: -7px;
  animation-delay: -1.1s;
}

.guide-orb__disc {
  position: absolute;
  left: -45px;
  top: -9px;
  width: 90px;
  height: 18px;
  border-radius: 9999px;
}

.guide-orb__disc--back {
  transform: translateY(-1px);
}

.guide-orb__disc--front {
  transform: translateY(1px);
}

.guide-orb__sphere {
  position: absolute;
  z-index: 3;
  top: 13px;
  left: 13px;
  width: 42px;
  height: 42px;
}

.guide-orb__outer,
.guide-orb__lens,
.guide-orb__body,
.guide-orb__shine {
  position: absolute;
  border-radius: 9999px;
}

.guide-orb__outer {
  inset: -12px;
  filter: blur(7px);
}

.guide-orb__lens {
  inset: -3px;
  border: 1px solid;
}

.guide-orb__body {
  inset: 0;
  box-shadow: inset -10px -12px 18px rgba(3, 7, 18, 0.68), inset 6px 6px 12px rgba(255, 255, 255, 0.16);
}

.guide-orb__shine {
  inset: 0;
}

.guide-orb__particle {
  position: absolute;
  border-radius: 9999px;
  box-shadow: 0 0 8px currentColor;
}

.guide-orb__particle--1 {
  width: 3px;
  height: 3px;
  animation: orb-particle-one 4.5s ease-in-out infinite;
}

.guide-orb__particle--2 {
  width: 2px;
  height: 2px;
  opacity: 0.7;
  animation: orb-particle-two 5.8s ease-in-out infinite;
}

@keyframes orb-ring-drift {
  0%, 100% {
    transform: translateY(0) scaleX(1);
  }
  50% {
    transform: translateY(1px) scaleX(1.04);
  }
}

@keyframes orb-particle-one {
  0%, 100% {
    transform: translate(-34px, -1px);
    opacity: 0.35;
  }
  50% {
    transform: translate(31px, 5px);
    opacity: 0.95;
  }
}

@keyframes orb-particle-two {
  0%, 100% {
    transform: translate(28px, -5px);
    opacity: 0.3;
  }
  50% {
    transform: translate(-24px, 4px);
    opacity: 0.75;
  }
}
</style>
