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
          Copyleft {{ new Date().getFullYear() }}.
        </div>
        <div class='level-item'>
          Licensed under&nbsp;<a href='https://www.gnu.org/licenses/agpl-3.0.en.html'>AGPL v3 or later</a>
        </div>
        <div class='level-item'>
          <a href='https://github.com/subins2000/vett'>Source Code</a>
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