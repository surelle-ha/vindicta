<template>
  <div class="fixed inset-0 -z-10" aria-hidden="true">
    <div class="absolute inset-0" style="background: var(--bg-base);" />
    <div class="orb orb-1" />
    <div class="orb orb-2" />
  </div>
</template>

<style scoped>
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(130px);
  pointer-events: none;
}
.orb-1 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, #3730a3 0%, transparent 70%);
  top: -250px;
  left: -150px;
  opacity: 0.07;
}
.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #4c1d95 0%, transparent 70%);
  bottom: -150px;
  right: -100px;
  opacity: 0.05;
}

/* Reduce orb intensity in light mode */
:root[data-theme="light"] .orb-1,
:root[data-theme="light"] .orb-2 {
  opacity: 0.03;
}
</style>
