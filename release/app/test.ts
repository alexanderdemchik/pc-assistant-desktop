import * as cv from '@u4/opencv4nodejs';

// async function matchImages(haystack, needle) {
//   const match = await haystack.matchTemplate(needle, cv.TM_CCOEFF_NORMED);

//   const dataList = match.getDataAsArray();

//   for (let y = 0; y < dataList.length; y++) {
//     for (let x = 0; x < dataList[y].length; x++) {
//       if (dataList[y][x] > 0.9) {
//         haystack.drawRectangle(new cv.Rect(x, y, needle.cols, needle.rows), new cv.Vec3(0, 255, 0), 2, cv.LINE_8);
//       }
//     }
//   }

//   cv.imshow('multiple matches', haystack);

//   cv.waitKey();
// }

// const h = cv.imread('./h.png');
// const n = cv.imread('./n.png');

// matchImages(h, n);
const detectAndComputeAsync = (det: cv.FeatureDetector, img: cv.Mat) =>
  det.detectAsync(img).then((kps) => det.computeAsync(img, kps).then((desc) => ({ kps, desc })));

const img1 = cv.imread('./h.png');
const img2 = cv.imread('./n.png');

const detectorNames = ['AKAZE', 'BRISK', 'KAZE', 'ORB'];
console.log(cv.ORBDetector);
// @ts-ignore
const createDetectorFromName = (name: string) => new cv[`${name}Detector`]();

// create 4 promises -> each detector detects and computes descriptors for img1 and img2
const promises = detectorNames.map(createDetectorFromName).map((det) =>
  // also detect and compute descriptors for img1 and img2 async
  Promise.all([detectAndComputeAsync(det, img1), detectAndComputeAsync(det, img2)]).then((allResults) =>
    cv.matchBruteForceAsync(allResults[0].desc, allResults[1].desc).then((matches) => ({
      matches,
      kps1: allResults[0].kps,
      kps2: allResults[1].kps,
    }))
  )
);

Promise.all(promises)
  .then((allResults) => {
    allResults.forEach((result, i) => {
      const drawMatchesImg = cv.drawMatches(img1, img2, result.kps1, result.kps2, result.matches);
      cv.imshowWait(detectorNames[i], drawMatchesImg);
      cv.destroyAllWindows();
    });
  })
  .catch((err) => console.error(err));
