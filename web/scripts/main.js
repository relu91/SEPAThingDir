/**
 * Handle notification message about changes in the thing list
 * @param {*} message
 */
function handleNotification(message) {
    let noti = JSON.parse(message.data);
    if (noti.added) {
        const template = `<div class="thingDesc">
                <object class="thingIcon" type="image/svg+xml" data="web/icon.svg">
                    |_|
                </object>
                <p>Thing <a href="/thing/${noti.added['@id']}">${noti.added['@id']}</a></p>
            </div>`;
        $(template).attr('id', noti.added['@id']).appendTo('#thinglist');
    }

    if (noti.removed) {
        $('#' + noti.removed).remove();
    }
}

$(document).ready(function() {
    let manager = new ConnectionManager();
    manager.newConn('{}');

    const textbox = $('#search');
    textbox.keypress(((connMan) => {
        return function onEvent(event) {
            if (event.key === 'Enter') {
                let message = event.target.value !== '' ? `{"type" : "${event.target.value}"}` : '{}';
                connMan.newConn(message);
                $('#thinglist').empty();
            }
    };
    })(manager));
});

/**
 * Simple utility class to handle websocket connection
 */
class ConnectionManager {
    /**
     * Initialize new connection
     * @param {*} type
     */
    newConn(initMessage) {
        if (this.oldConn) {
            this.oldConn.close();
        }

        let wsURL = new URL(window.location.href);
        wsURL.port = 3001;
        wsURL.protocol = 'ws';
        let ws = new WebSocket(wsURL);

        ws.onopen = () => {
            ws.send(initMessage);
            //  ws.send(`{"type" : "${textbox.value}}`);
        };

        ws.onmessage = handleNotification;
        this.oldConn = ws;
    }
}

