<template>
  <footer class='footer'>
    <nav class='level'>
      <div class='level-left'>
        <div class='level-item'>
          No Server<br/>
          No Storage<br/>
          Peer To Peer !
        </div>
      </div>
      <div class='level-right'>
        <div class='level-item'>
          Copyleft {{ new Date().getFullYear() }}
        </div>
        <div class='level-item'>
          <router-link to='/about'>About Game</router-link>
        </div>
      </div>
    </nav>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>