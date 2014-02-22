var Repo = Backbone.Model.extend();

var Commit = Backbone.Model.extend({
    parse: function (data) {
        return {
            sha: data.sha,
            author_avatar: data.author.avatar_url + '&s=80',
            author: data.commit.author.name,
            message: data.commit.message,
            url: data.html_url
        }
    },
    headerToHTML: function(){
        var keys = this.keys();
        keys.pop();
        return _.map(keys, function(key) {
            return "<th>"+key+"</th>";
        }).join('');
    },
    detailsToHTML: function () {
        var details = this.attributes;
        return "<tr><td><a href=" + details.url + ">" + details.sha + "</a></td><td>" +
            "<img class='avatar' src=" + details.author_avatar + "/></td><td>" + details.author +
            "</td><td>" + details.message+"</td></tr>"
    }
});

var Commits = Backbone.Collection.extend({
    model: Commit,
    url: function() {
        var url = "https://api.github.com/repos/"+repo.get('name')+'/commits'
                  + this.hasBranch();
        return url;
    },
    initialize: function () {
        this.fetch();
    },
    hasBranch: function () {
        return (repo.get('branch') ? '?sha='+repo.get('branch') : '');
    }
});

var CommitsView = Backbone.View.extend({
    el: "#commits",
    template: _.template('<table><thead><%=commits.models[0].headerToHTML()%></thead><% commits.forEach(function(c){ %><%= c.detailsToHTML()%><% }) %></table>'),
    initialize: function () {
        this.collection.on('add', this.render, this);
    },
    render: function() {
        var compiled_html = this.template({commits: this.collection});
        $(this.el).html(compiled_html);
    }
});

var FormView = Backbone.View.extend({
    el: "#repo",
    events: {
        "click button": "submit"
    },
    submit: function (ev) {
        fetchCommits($(ev.currentTarget).siblings('input').val())
    }
})
var form = new FormView();

function formatData (name) {
    if (name.indexOf('#') == -1) {
        return {name: name};
    } else {
        var d = name.split('#');
        return {name: d[0], branch: d[1]};
    }
}

function fetchCommits(name) {
    window.repo = new Repo(formatData(name));
    window.commits = new Commits();
    window.commitsView = new CommitsView({collection: commits});
}
