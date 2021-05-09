var app = Vue.createApp({
    data() {
        return {
            players: [],
            newPlayerName: "",
            apiEndpoint: "http://localhost:8000",  // TODO: set in UI
        }
    },
    created() {
        this.loadPlayers();
    },
    methods: {
        apiCall(path, args) {
            return fetch(this.apiEndpoint + path, args);
        },
        addPlayer() {
            if (this.newPlayerName != "") {
                let payload = {
                    email: this.newPlayerName + "@example.com",  // TODO
                    full_name: this.newPlayerName,
                    password: ""
                };
                this.newPlayerName = "";
                this.apiCall("/users/new", {
                    method: "POST",
                    body: JSON.stringify(payload)
                })
                    .then(p => p.ok
                        ? p.json().then(j => this.players.push(j))
                        : p.json().then(j => console.warn("%o: %o", payload, j))
                    );
            }
        },
        loadPlayers() {
            this.apiCall("/users").then(f => f.json()).then(j => this.players = j);
        }
    },
    provide() {
        return {
            apiCall: this.apiCall
        }
    }
});

app.component("player", {
    template: "#player-template",
    inject: ["apiCall"],
    props: {
        full_name: String,
        id: Number,
    },
    methods: {
        removePlayer() {
            this.apiCall(`/users/${this.id}`, { method: "DELETE" }).then(r => {
                if (r.ok)
                    this.$root.players = this.$root.players.filter(p => p.id != this.id);
            });
        }
    }
});

var vm;
window.onload = function () {
    vm = app.mount("#app");
    $("#app").css("display", "block");
};
