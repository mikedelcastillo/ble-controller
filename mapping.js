let keyMapping = [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [0, 11],
    ["q", 16],
    ["w", 17],
    ["e", 18],
    ["r", 19],
    ["t", 20],
    ["y", 21],
    ["u", 22],
    ["i", 23],
    ["o", 24],
    ["p", 25],
    ["a", 30],
    ["s", 31],
    ["d", 32],
    ["f", 33],
    ["g", 34],
    ["h", 35],
    ["j", 36],
    ["k", 37],
    ["l", 38],
    ["z", 44],
    ["x", 45],
    ["c", 46],
    ["v", 47],
    ["b", 48],
    ["n", 49],
    ["m", 50],
    ["space", 57],
    ["enter", 28],
]

let toKeyCode = {}
let toMapping = {}

keyMapping.forEach(pair => {
    toKeyCode[pair[0]] = pair[1]
    toMapping[pair[1]] = pair[0]
})

module.exports = {
    toKeyCode,
    toMapping,
    keyMapping,
}