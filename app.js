var app = Vue.createApp({
    data() {
        return {
            apiBase: "https://fohs-score-tracker.herokuapp.com",
            authHeader: "",
            email: "",
            loginError: "",
            newPlayerName: "",
            password: "",
            players: [],
        }
    },
    mounted() {
        $('#login').modal({
            backdrop: "static",
            keyboard: false
        });
    },
    methods: {
        apiCall(path, args = {}) {
            if (!args.headers)
                args.headers = {};
            args.headers["Authorization"] = this.authHeader;
            return fetch(this.apiBase + path, args);
        },
        addPlayer() {
            if (this.newPlayerName != "") {
                let payload = {
                    name: this.newPlayerName,
                };
                this.newPlayerName = "";
                this.apiCall("/players/new", {
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
            this.apiCall("/players").then(f => f.json()).then(j => this.players = j);
        },
        login() {
            if (!$("#input-email")[0].checkValidity()) {
                this.loginError = "Please enter a valid email address";
                return;
            } else if (!$("#input-password")[0].checkValidity()) {
                this.loginError = "Please enter a password.";
                return;
            }
            // TODO: save login info somewhere
            this.authHeader = `Basic ${btoa(`${this.email}:${this.password}`)}`;
            this.apiCall("/users/me").then(r => {
                if (r.ok) {
                    $("#login").modal("hide");
                    this.loadPlayers();
                } else {
                    r.json().then(j => this.loginError = j.detail + ".");
                }
            }).catch(e => this.loginError = "Can't connect to server.");
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
        name: String,
        id: Number,
    },
    methods: {
        removePlayer() {
            this.apiCall(`/players/${this.id}`, { method: "DELETE" }).then(r => {
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
