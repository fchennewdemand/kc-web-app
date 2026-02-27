<template>
  <div class="max-w-4xl mx-auto">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold">Customer Service</h1>
      </template>
      <div class="space-y-4">
        <UButton to="/cs/website" size="lg" block>Website Feedback</UButton>
        <UButton to="/cs/trip-planner" size="lg" block>Trip Planner Feedback</UButton>
        <UButton to="/cs/general" size="lg" block>Other Topics Feedback</UButton>
        <UButton to="/cs/ride" size="lg" block>Bus Ride Feedback</UButton>
        <UButton to="/cs/driver" size="lg" block>Bus Driver Feedback</UButton>
        <UButton to="/cs/shelter" size="lg" block>Bus Stop/Shelter Feedback</UButton>
        <UButton to="/cs/lost-found" size="lg" block>Lost and Found</UButton>
        <UButton to="/cs/ro" size="lg" block>Van Pool</UButton>
        <UButton to="/cs/a3" size="lg" block>Access Link</UButton>
      </div>
    </UCard>
  </div>
</template>
