var app = Vue.createApp({
    data() {
        return {
            players: [],
            newPlayerName: "",
            idCount: 0
        }
    },
    methods: {
        addPlayer() {
            if (this.newPlayerName != "") {
                this.players.push({
                    name: this.newPlayerName,
                    points: 0,
                    id: ++this.idCount
                });
                this.newPlayerName = "";
            }
        }
    }
});

app.component("player", {
    template: "#player-template",
    props: {
        name: String,
        id: Number,
        points: Number
    },
    methods: {
        addPoint() {
            this.$root.players.find(p => p.id == this.id).points++;
        },
        removePlayer() {
            this.$root.players = this.$root.players.filter(p => p.id != this.id);
        }
    }
});

var vm;

window.onload = function() {
    vm = app.mount("#app");
    $("#app").css("display", "block");
};
