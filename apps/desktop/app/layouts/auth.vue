<template>
  <div class="h-screen flex flex-col overflow-hidden bg-[#0d0d0f]">
    <AppBackground />
    <TitleBar />
    <div class="relative z-10 flex-1 overflow-auto">
      <slot />
    </div>
  </div>
</template>
