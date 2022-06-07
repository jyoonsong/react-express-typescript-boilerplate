const getAgreement = (arr) => {
    const num_raters = arr.length;
    const categories = [1, 2, 3, 4, 5];

    const denominator = num_raters * (num_raters - 1)

    let A = 0;
    for (let i = 0; i < categories.length; i++) {
        let freq = arr.filter(ele => ele === categories[i]).length;
        let numerator = freq * (freq - 1)
        A += numerator / denominator
    }

    return A;
}

// const getAgreement = (scores) => {
//     const num_raters = scores.length;
//     const agreed_raters = cluster(scores).length;
//     return agreed_raters / num_raters;
// }

// const partition = (arr, indices) => {
//     indices.sort((x, y) => x - y);

//     if (indices.length === 0) {
//         return arr;
//     } 

//     let prev = -1;
//     let stack = [];
//     for (let i = 0; i < indices.length; i++) {
//         if (indices[i] !== prev) {
//             stack.push(indices[i]);
//         }
//         else {
//             stack.pop(indices[i])
//         }
//         prev = indices[i];
//     }

//     if (indices.length % 2 !== 0) {
//         return arr;
//     }

//     // console.log(stack);

//     let result = [];

//     if (stack[0] !== 0) {
//         let sliced = arr.slice(0, stack[0]);
//         result.push(sliced);
//     }

//     for (let i = 0; i < stack.length - 1; i++) {
//         let start = stack[i];
//         let end = stack[i + 1];

//         if (i % 2 === 0) {
//             end += 1;
//         }
//         else {
//             start += 1;
//         }
//         sliced = arr.slice(start, end);
//         result.push(sliced);

//         if (i === stack.length - 2 && end !== arr.length) {
//             sliced = arr.slice(end + 1, arr.length);
//             result.push(sliced);
//         }
//     }

//     return result;
// }

// const cluster = (arr, num_clusters) => {
//     // sort the array
//     arr.sort((x, y) => y - x);
//     // get difference between adjacent elements
//     let diffs = arr.map((e, i) => {
//         return i !== arr.length - 1 ? {
//             index: i,
//             diff: e - arr[i + 1],
//         } : e;
//     });

//     // clean up and sort the differences
//     diffs = diffs.slice(0, diffs.length - 1);
//     diffs.sort((x, y) => x.diff - y.diff);

//     let indices = []
//     let result = [];
//     for (let i = 0; i < diffs.length; i++) {
//         // add two indices to the array
//         indices.push(diffs[i].index);
//         indices.push(diffs[i].index + 1);

//         // partition the array with the indices
//         result = partition(arr, indices);
//         if (result.length === num_clusters) {
//             break;
//         }
//     }

//     // only return the majority array
//     return result.reduce((x, y) => x.length > y.length ? x : y);
// }

const cluster = (scores) => {
    const good = scores.filter(score => score >= 3);
    const bad = scores.filter(score => score < 3);

    if (good.length > bad.length)
        return [3, 4, 5];
    else if (good.length < bad.length)
        return [1, 2]

    return [];
}

module.exports = {
    getAgreement,
    cluster,
}