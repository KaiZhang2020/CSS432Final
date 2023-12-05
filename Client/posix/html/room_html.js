const RoomHTML = (roomID,user1,user2,HttpRequests) =>
`<html>
    <body>
        <h4>Welcome to Room 
            <br/>${roomID}
        </h4>
        <h5 id='usernames'>
            User 1: ${user1} 
            <br/>
            User 2: ${user2}
        </h5>
    </body>
    <script>
        if (\`${user1}\`==='undefined'&&\`${user2}\`==='undefined'){ // redirect to /lobby if no user1
            window.location.href = '/';
        }
        let user = [];
        function changeContent(elementId, text) {
            var element = document.getElementById(elementId);
            if (element) {
                element.textContent = text;
            } else {
                console.log('Element for changeContent(elementId, text) not found');
            }
        }
        const storedValue = sessionStorage.getItem('username');
        console.log('username',storedValue)
        
        const httpRequests = new ${HttpRequests}();
        document.addEventListener('visibilitychange', () => {
            // const username = sessionStorage.getItem('username'); // sessionStorage
            if (storedValue) {
                httpRequests.sendVisibilityState(storedValue,'room');
                console.log(storedValue,'VISISBLE')
            } else {

                console.log(storedValue,'INVISISBLE')
            }
        });
        // setInterval(()=>httpRequests.sendVisibilityState(storedValue,'room'), 5000);
    </script>
</html>`

module.exports = RoomHTML;