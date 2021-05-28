var app = Vue.createApp({
    data() {
        return {
            apiBase: "https://fohs-score-tracker.herokuapp.com",
            authHeader: "",
            email: "",
            emailHint: "",
            loginModal: null,
            loginWarning: false,
            newPlayerName: "",
            password: "",
            passwordHint: "",
            players: [],
            waitingForLogin: false,
        };
    },
    mounted() {
        this.loginModal = new bootstrap.Modal(this.$refs.login, {
            keyboard: false,
            backdrop: "static",
        });
        this.loginModal.show();

        var canvas = document.getElementById("main-canvas"),
            context = canvas.getContext("2d");

        base_image = new Image();
        base_image.src = "./court-placeholder.png";
        base_image.onload = function () {
            context.drawImage(base_image, 0, 0);
        };
    },
    methods: {
        apiCall(path, args = {}) {
            if (!args.headers) args.headers = {};
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
                    body: JSON.stringify(payload),
                }).then((p) =>
                    p.ok
                        ? p.json().then((j) => this.players.push(j))
                        : p
                              .json()
                              .then((j) => console.warn("%o: %o", payload, j))
                );
            }
        },
        loadPlayers() {
            this.apiCall("/players")
                .then((f) => f.json())
                .then((j) => (this.players = j));
        },
        login() {
            this.emailHint = "";
            this.passwordHint = "";
            this.loginWarning = false;
            if (!this.$refs.email.checkValidity()) {
                this.emailHint = "Please enter a valid email address.";
                return;
            } else if (!this.$refs.password.checkValidity()) {
                this.passwordHint = "Please enter a password.";
                return;
            }
            // TODO: save login info somewhere
            this.authHeader = `Basic ${btoa(`${this.email}:${this.password}`)}`;
            this.waitingForLogin = true;
            this.apiCall("/users/me")
                .then((r) => {
                    if (r.ok) {
                        this.loginModal.hide();
                        this.loadPlayers();
                    } else {
                        r.json().then((j) => {
                            if (j.detail.includes("password"))
                                this.passwordHint = j.detail + ".";
                            else this.emailHint = j.detail + ".";
                        });
                    }
                })
                .catch((e) => {
                    this.loginWarning = true;
                })
                .finally(() => {
                    this.waitingForLogin = false;
                });
        },
    },
    provide() {
        return {
            apiCall: this.apiCall,
        };
    },
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
            this.apiCall(`/players/${this.id}`, { method: "DELETE" }).then(
                (r) => {
                    if (r.ok)
                        this.$root.players = this.$root.players.filter(
                            (p) => p.id != this.id
                        );
                }
            );
        },
    },
});

var vm;
window.onload = function () {
    vm = app.mount("#app");
};
