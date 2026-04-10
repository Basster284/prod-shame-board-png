// навайбленная каша
// сработай пожалуйста
function fetch() {
  var xml = new XMLHttpRequest();
  xml.open("GET", "data/shame.json", false);
  xml.send();
  if (xml.readyState == 4) {
    if (xml.status == 200) {
      var data = JSON.parse(xml.responseText);
      return data;
    }
  }
  return [];
}
var entries = fetch();
entries.sort(function(a, b){
  if (a.date > b.date) return -1;
  if (a.date < b.date) return 1;
  return 0;
});
var board = document.getElementById("board");
var counter = document.getElementById("counter");
var search = document.getElementById("search");
var lastSearch = " ";

function isArr(obj) {
  return obj && typeof obj === 'object' && typeof obj.length === 'number';
}

function esc(s) {
  var d = document.createElement("div");
  d.innerText = s;
  return d.innerHTML;
}

function escNl(s) {
  return esc(s).replace(/\n/g, "<br>");
}

function avatarHTML(telegram) {
  var clean = telegram.replace("@", "");
  var letter = clean.charAt(0).toUpperCase();
  return '<div class="entry-avatar"><img src="avatars/' + clean + '.png" '
  + 'alt="' + telegram + '" onerror="this.style.display = \"none\""></div>';
}

function usernameHTML(telegram) {
  var clean = telegram.replace("@", "");
  return '<div class="entry-username"><a href="https://t.me/' + esc(clean) + '" target=\'_blank\'>' + esc(clean) + '</a></div>';
}

function renderMsgImages(image) {
  if (!image) return "";
  var urls = isArr(image) ? image : [image];
  return '<div class="quote-msg-images">' + urls.map(function(url) {
    return '<img src="' + esc(url) + '" alt="" loading="lazy"onclick="window.open(this.src,\'_blank\')">';
  }).join("") + '</div>';
}

function renderImages(images) {
  if (!images) return "";
  var list = Array.isArray(images) ? images : [images];
  return '<div class="entry-images">' + list.map(function(url) {
    return '<img src="' + esc(url) + '" alt="" loading="lazy"onclick="window.open(this.src,"_blank")">';
  }).join("") + '</div>';
}

function renderQuote(quote) {
  if (typeof quote === "string") {
    return '<span class="quote-single">' + escNl(quote)  + '</span>';
  }

  if (typeof quote[0] === "string") {
    return quote
      .map(function(line) {
        return '<div class="quote-line">' + escNl(line) +'</div>'
      })
      .join("");
  }

  return quote
    .map(function(msg) {
      var authorHTML = '<span class="quote-msg-author">' + esc(msg.from) + '</span>';
      var imagesHTML = renderMsgImages(msg.image);
      var textHTML = msg.text
        ? '<span class="quote-msg-text">' + escNl(msg.text) + '</span>'
        : "";
      return '<div class="quote-msg">' + authorHTML
      + imagesHTML + textHTML + '</div>';
    })
    .join("");
}

function quoteIncludes(quote, q) {
  var item;
  if (typeof quote === "string") {
    return quote.toLowerCase().indexOf(q) !== -1;
  }
  for (var i = 0; i < quote.length; i++) {
    item = quote[i];
    if (typeof item == "string") {
      if (item.toLowerCase().indexOf(q) !== -1) return true;
    } else {
      var textMatch = (item.text || "").toLowerCase().indexOf(q) !== -1;
      var fromMatch = (item.from || "").toLowerCase().indexOf(q) !== -1;
      if (textMatch || fromMatch) return true;
    }
  }
  return false;
}

function renderCounter(data) {
  var uniqueUsers = [];
  for (var i = 0; i < data.length; i++) {
    var user = data[i].telegram;
    var found = false;
    for (var j = 0; j < uniqueUsers.length; j++) {
      if (uniqueUsers[j] === user) {
        found = true;
        break;
      }
    }
    if (!found) {
      uniqueUsers.push(user);
    }
  }
  counter.innerHTML =
    data.length === 0
      ? ""
      : '<strong>' + data.length + '</strong> позорных записей · <strong>' + uniqueUsers.length + '</strong> уникальных авторов';
}

function renderBoard(data) {
  if (data.length === 0) {
    board.innerHTML = '<div class="empty"><div class="empty-icon">😇</div><p>Ничего не найдено.</p></div>';
    return;
  }
  
  var html = "";
  for (var i = 0; i < data.length; i++) {
    var entry = data[i];
    var descHTML = entry.description ? '<div class="entry-desc">' + esc(entry.description) + '</div>' : "";
    var imagesHTML = renderImages(entry.images);
    var evidenceHTML = entry.evidence ? '<a href="' + esc(entry.evidence) + '" target="_blank" class="entry-evidence">📎 пруф</a>' : "";
    
    html += '<div class="entry">' +
              '<div class="entry-header">' +
                  avatarHTML(entry.telegram) +
                  usernameHTML(entry.telegram) +
              '</div>' +
              descHTML +
              imagesHTML +
              '<div class="entry-quote">' + renderQuote(entry.quote) + '</div>' +
              '<div class="entry-footer">' +
                  '<span class="entry-date">' + entry.date + '</span>' +
                  evidenceHTML +
              '</div>' +
            '</div>';
  }
  board.innerHTML = html;
}

function apply() {
  var q = search.value.toLowerCase().replace(/^\s+|\s+$/g, '');

  if (q == lastSearch) return;
  lastSearch = q;

  var filtered = [];

  if (!q) {
    filtered = entries;
  } else {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var telegramMatch = e.telegram.toLowerCase().indexOf(q) !== -1;
      var descMatch = (e.description || "").toLowerCase().indexOf(q) !== -1;
      var quoteMatch = quoteIncludes(e.quote, q);
      
      if (telegramMatch || descMatch || quoteMatch) {
        filtered.push(e);
      }
    }
  }
  renderBoard(filtered);
  renderCounter(filtered);
}

search.onkeyup = apply;
search.oninput = apply;
apply();