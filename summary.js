/**
 * Created by Xuewei Wu on 12/5/15.
 *
 * The output includes:
 * 1. The number of words in the document
 * 2. The number of lines
 * 3. A list of all the words with the count of their occurrence, in descending order
 * 4. A list of the ten most common trigrams
 * 5. A listing of the edit distances between the most common trigram and the next ten most common trigrams,
 * in order of distance value. This should include the trigrams being compared and the edit distance value.
 */

/* util functions */

/* given filename, read the file and return content */
function readData(filename) {
    var fs = require("fs");
    var data = fs.readFileSync(filename);

    return data.toString();
}

/* parse the data and return words array */
function getWords(data) {
    /* as mentioned in piazza, empty words cannot be counted, so add trim() here */
    return words = data.replace(/[.,?!;()"'-]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .trim()
        .split(" ");
}

/* change the object to array with key and value as elements */
function obj2arr(obj) {
    var arr = [];

    for (var key in obj)
        arr.push([key, obj[key]]);

    return arr;
}

/* given object, return the sorted array according to descending order of values, and then keys */
function obj2sortedArr(obj) {
    var arr = obj2arr(obj);
    arr.sort(
        function (a, b) {
            if (a[1] > b[1]) {
                return -1;
            } else if (a[1] == b[1]) {
                if (a[0] > b[0]) {
                    return -1;
                } else if (a[0] == b[0]) {
                    return 0;
                } else {
                    return 1;
                }
            } else {
                return 1;
            }
        });
    return arr;
}

/* calculate edit distance of two strings */
function editDistance(str1, str2) {
    var len1 = str1.length + 1;
    var len2 = str2.length + 1;

    var dist = [];
    for (var i = 0; i < len1; i++) {
        dist[0] = [];
        for (var j = 0; j < len2; j++) {
            dist[0][j] = j;
        }
    }

    for (var i = 1; i < len1; i++) {
        dist[i] = [];
        dist[i][0] = i;
        for (var j = 1; j < len2; j++) {
            dist[i][j] = Math.min(dist[i - 1][j] + 1, dist[i][j - 1] + 1,
                str1[i - 1] == str2[j - 1] ? dist[i - 1][j - 1] : dist[i - 1][j - 1] + 1);
        }
    }
    return dist[len1 - 1][len2 - 1];
}

/* for producing html */
function obj2htmlTable(obj) {
    html = '<table>'

    for (var key in obj) {
        var values = obj[key].toString().split(',');
        html += '<tr>\n<td>' + (parseInt(key) + 1) + '.</td>\n<td>' + values[0] + '</td>\n';
        if (values.length > 1) {
            html += '<td>' + values[1] + '</td>\n';
        }
        html += '</tr>\n';
    }
    return html + '</table>\n';
}

/*
 1. Count the number of words in the document
 */
function countWords(words) {
    var index = {};

    words.forEach(function (word) {
        if (!(index.hasOwnProperty(word))) {
            index[word] = 0;
        }
        index[word]++;
    });

    return index;
}

/*
 2. The number of lines
 */
function cntLines(data) {
    var lines = data.split("\n");
    var cnt = 0;
    for(var i = 0; i < lines.length; i++){
        /* As mentioned in Piazza, empty line will not be counted */
        if(lines[i].trim().length > 0) {
            cnt += 1;
        }
    }
    return cnt;
}

/*
 3. A list of all the words with the count of their occurrence, in descending order
 */
function sortWords(word2cnt) {
    return obj2sortedArr(word2cnt);
}


/* 4. A list of the ten most common trigrams */
function getTopTrigrams(words, n) {
    var trigram_cnt = {}

    for (var j = 0; j < words.length - 3; j++) {
        var tri = words.slice(j, j + 3).join(' ');
        if (!(trigram_cnt.hasOwnProperty(tri))) {
            trigram_cnt[tri] = 0;
        }
        trigram_cnt[tri]++;
    }

    var sortedTrigrams = obj2sortedArr(trigram_cnt);
    return sortedTrigrams.slice(0, n);
}




var filename = "pg45.txt";

var data = readData(filename);
words = getWords(data);
word2cnt = countWords(words);

/* 1. The number of words in the document */
var wordNum = obj2arr(word2cnt).length;

/* 2. The number of lines */
var lineNum = cntLines(data);

/* 3. A list of all the words with the count of their occurrence, in descending order */
var sortedWords = sortWords(word2cnt);

/* 4. A list of the ten most common trigrams */
var top10trigrams = getTopTrigrams(words, 10);

/*
 * 5. A listing of the edit distances between the most common trigram and the next ten most common trigrams,
 * in order of distance value. This should include the trigrams being compared and the edit distance value.
 */
var top11trigram2cnts = getTopTrigrams(words, 11);
var topTrigram = top11trigram2cnts[0][0];
var pair2dists = []
for (var i = 1; i < 11; i++) {
    pair2dists['"' + topTrigram + '" & "' + top11trigram2cnts[i][0] + '"'] =
        editDistance(topTrigram, top11trigram2cnts[i][0]);
}
dists = obj2sortedArr(pair2dists).reverse();

var topic5 = "A listing of the edit distances between the most common trigram" +
" and the next ten most common trigrams, in order of distance value. " +
"This should include the trigrams being compared and the edit distance value";
var html = '<html><head><style>h1 {text-align:center;}</style>\n<title>' +
    filename + ' Document Summary Statistics</title>\n</head>\n';
html += '<body><h1>' + filename + ' Document Summary Statistics</h1>\n';
html += '<h2>1. #Word (As mentioned in Piazza, empty word will not be counted): </h2>';
html += '<li>' + wordNum + '</li>\n';
html += '<h2>2. #Line (As mentioned in Piazza, empty line will not be counted): </h2>\n';
html += '<li>a. remove empty lines:' + lineNum + '</li>\n';
html += '<li>b. include empty lines:' + data.split('\n').length + '</li>\n';
html += '<h2>3. Ten most common trigrams and its frequency:</h2>\n';
html += obj2htmlTable(top10trigrams);
html += '<h2>4. ' + topic5 + ':</h2>\n';
html += obj2htmlTable(dists);
html += '<h2>5. Word & Frequency, in descending order:</h2>\n';
html += obj2htmlTable(sortedWords);
html += '</body>\n</html>\n';

var outfile = filename.split('.')[0] + '_statistics.html';

var fs = require("fs")
fs.writeFile(outfile, html, function (err) {
    if (err) {
        return console.error(err);
    }
});
