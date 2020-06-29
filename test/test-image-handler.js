/** *******************************************************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/LICENSE-2.0                                                                    *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 ******************************************************************************************************************** */

const sharp = require('sharp');
const assert = require('assert');
const ImageHandler = require('../image-handler');

// ----------------------------------------------------------------------------
// [async] process()
// ----------------------------------------------------------------------------
describe('process()', () => {
  describe('001/default', () => {
    it('Should pass if the output image is different from the input image with edits applied', async () => {
      // Arrange
      const sinon = require('sinon');
      // ---- Amazon S3 stub
      const S3 = require('aws-sdk/clients/s3');
      const getObject = S3.prototype.getObject = sinon.stub();
      getObject.returns({
        promise: () => ({
          Body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
        }),
      });
      // ----
      const request = {
        requestType: 'default',
        bucket: 'sample-bucket',
        key: 'sample-image-001.jpg',
        edits: {
          grayscale: true,
          flip: true,
        },
        originalImage: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
      };
      // Act
      const imageHandler = new ImageHandler();
      const result = await imageHandler.process(request);
      // Assert
      assert.deepEqual((request.originalImage !== result), true);
    });
  });
  describe('002/withToFormat', () => {
    it('Should pass if the output image is in a different format than the original image', async () => {
      // Arrange
      const sinon = require('sinon');
      // ---- Amazon S3 stub
      const S3 = require('aws-sdk/clients/s3');
      const getObject = S3.prototype.getObject = sinon.stub();
      getObject.returns({
        promise: () => ({
          Body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
        }),
      });
      // ----
      const request = {
        requestType: 'default',
        bucket: 'sample-bucket',
        key: 'sample-image-001.jpg',
        outputFormat: 'png',
        edits: {
          grayscale: true,
          flip: true,
        },
        originalImage: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
      };
      // Act
      const imageHandler = new ImageHandler();
      const result = await imageHandler.process(request);
      // Assert
      assert.deepEqual((request.originalImage !== result), true);
    });
  });
  describe('003/noEditsSpecified', () => {
    it('Should pass if no edits are specified and the original image is returned', async () => {
      // Arrange
      const sinon = require('sinon');
      // ---- Amazon S3 stub
      const S3 = require('aws-sdk/clients/s3');
      const getObject = S3.prototype.getObject = sinon.stub();
      getObject.returns({
        promise: () => ({
          Body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
        }),
      });
      // ----
      const request = {
        requestType: 'default',
        bucket: 'sample-bucket',
        key: 'sample-image-001.jpg',
        originalImage: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
      };
      // Act
      const imageHandler = new ImageHandler();
      const result = await imageHandler.process(request);
      // Assert
      assert.deepEqual(result, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    });
  });
});

// ----------------------------------------------------------------------------
// [async] applyEdits()
// ----------------------------------------------------------------------------
describe('applyEdits()', () => {
  describe('001/standardEdits', () => {
    it(`Should pass if a series of standard edits are provided to the
            function`, async () => {
      // Arrange
      const originalImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      const edits = {
        grayscale: true,
        flip: true,
      };
      // Act
      const imageHandler = new ImageHandler();
      const result = await imageHandler.applyEdits(originalImage, edits);
      // Assert
      const expectedResult1 = (result.options.greyscale);
      const expectedResult2 = (result.options.flip);
      const combinedResults = (expectedResult1 && expectedResult2);
      assert.deepEqual(combinedResults, true);
    });
  });
  describe('002/overlay', () => {
    it(`Should pass if an edit with the overlayWith keyname is passed to
            the function`, async () => {
      // Arrange
      const sinon = require('sinon');
      // ---- Amazon S3 stub
      const S3 = require('aws-sdk/clients/s3');
      const getObject = S3.prototype.getObject = sinon.stub();
      getObject.returns({
        promise: () => ({
          Body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
        }),
      });
      // Act
      const originalImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      const edits = {
        overlayWith: {
          bucket: 'aaa',
          key: 'bbb',
        },
      };
      // Assert
      const imageHandler = new ImageHandler();
      await imageHandler.applyEdits(originalImage, edits).then((result) => {
        assert.deepEqual(result.options.input.buffer, originalImage);
      });
    });
  });
  describe('003/smartCrop', () => {
    it(`Should pass if an edit with the smartCrop keyname is passed to
            the function`, async () => {
      // Arrange
      const sinon = require('sinon');
      // ---- Amazon Rekognition stub
      const rekognition = require('aws-sdk/clients/rekognition');
      const detectFaces = rekognition.prototype.detectFaces = sinon.stub();
      detectFaces.returns({
        promise: () => ({
          FaceDetails: [{
            BoundingBox: {
              Height: 0.18,
              Left: 0.55,
              Top: 0.33,
              Width: 0.23,
            },
          }],
        }),
      });
      // Act
      const originalImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      const edits = {
        smartCrop: {
          faceIndex: 0,
          padding: 0,
        },
      };
      // Assert
      const imageHandler = new ImageHandler();
      await imageHandler.applyEdits(originalImage, edits).then((result) => {
        // console.log(result);
        const sharp = require('sharp');
        const originalImageData = sharp(originalImage);
        assert.deepEqual((originalImageData.options.input !== result.options.input), true);
      }).catch((err) => {
        console.log(err);
      });
    });
  });
  describe('004/smartCrop/paddingOutOfBoundsError', () => {
    it(`Should pass if an excessive padding value is passed to the
            smartCrop filter`, async () => {
      // Arrange
      const sinon = require('sinon');
      // ---- Amazon Rekognition stub
      const rekognition = require('aws-sdk/clients/rekognition');
      const detectFaces = rekognition.prototype.detectFaces = sinon.stub();
      detectFaces.returns({
        promise: () => ({
          FaceDetails: [{
            BoundingBox: {
              Height: 0.18,
              Left: 0.55,
              Top: 0.33,
              Width: 0.23,
            },
          }],
        }),
      });
      // Act
      const originalImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      const edits = {
        smartCrop: {
          faceIndex: 0,
          padding: 80,
        },
      };
      // Assert
      const imageHandler = new ImageHandler();
      await imageHandler.applyEdits(originalImage, edits).then((result) => {
        // console.log(result);
        const sharp = require('sharp');
        const originalImageData = sharp(originalImage);
        assert.deepEqual((originalImageData.options.input !== result.options.input), true);
      }).catch((err) => {
        console.log(err);
      });
    });
  });
  describe('005/smartCrop/boundingBoxError', () => {
    it(`Should pass if an excessive faceIndex value is passed to the
            smartCrop filter`, async () => {
      // Arrange
      const sinon = require('sinon');
      // ---- Amazon Rekognition stub
      const rekognition = require('aws-sdk/clients/rekognition');
      const detectFaces = rekognition.prototype.detectFaces = sinon.stub();
      detectFaces.returns({
        promise: () => ({
          FaceDetails: [{
            BoundingBox: {
              Height: 0.18,
              Left: 0.55,
              Top: 0.33,
              Width: 0.23,
            },
          }],
        }),
      });
      // Act
      const originalImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      const edits = {
        smartCrop: {
          faceIndex: 10,
          padding: 0,
        },
      };
      // Assert
      const imageHandler = new ImageHandler();
      await imageHandler.applyEdits(originalImage, edits).then((result) => {
        // console.log(result);
        const sharp = require('sharp');
        const originalImageData = sharp(originalImage);
        assert.deepEqual((originalImageData.options.input !== result.options.input), true);
      }).catch((err) => {
        console.log(err);
      });
    });
  });
  describe('006/smartCrop/faceIndexUndefined', () => {
    it(`Should pass if a faceIndex value of undefined is passed to the
            smartCrop filter`, async () => {
      // Arrange
      const sinon = require('sinon');
      // ---- Amazon Rekognition stub
      const rekognition = require('aws-sdk/clients/rekognition');
      const detectFaces = rekognition.prototype.detectFaces = sinon.stub();
      detectFaces.returns({
        promise: () => ({
          FaceDetails: [{
            BoundingBox: {
              Height: 0.18,
              Left: 0.55,
              Top: 0.33,
              Width: 0.23,
            },
          }],
        }),
      });
      // Act
      const originalImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      const edits = {
        smartCrop: true,
      };
      // Assert
      const imageHandler = new ImageHandler();
      await imageHandler.applyEdits(originalImage, edits).then((result) => {
        // console.log(result);
        const sharp = require('sharp');
        const originalImageData = sharp(originalImage);
        assert.deepEqual((originalImageData.options.input !== result.options.input), true);
      }).catch((err) => {
        console.log(err);
      });
    });
  });
});

// ----------------------------------------------------------------------------
// [async] getOverlayImage()
// ----------------------------------------------------------------------------
describe('getOverlayImage()', () => {
  describe('001/validParameters', () => {
    it(`Should pass if the proper bucket name and key are supplied,
            simulating an image file that can be retrieved`, async () => {
      // Arrange
      const S3 = require('aws-sdk/clients/s3');
      const sinon = require('sinon');
      const getObject = S3.prototype.getObject = sinon.stub();
      getObject.withArgs({ Bucket: 'validBucket', Key: 'validKey' }).returns({
        promise: () => ({
          Body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
        }),
      });
      // Act
      const imageHandler = new ImageHandler();
      const metadata = await sharp(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')).metadata();
      const result = await imageHandler.getOverlayImage('validBucket', 'validKey', '100', '100', '20', metadata);
      // Assert
      assert.deepEqual(result, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVQI12P4z8CQCgAEZgFlTg0nBwAAAABJRU5ErkJggg==', 'base64'));
    });
  });
  describe('002/imageDoesNotExist', async () => {
    it(`Should throw an error if an invalid bucket or key name is provided,
            simulating a non-existant overlay image`, async () => {
      // Arrange
      const S3 = require('aws-sdk/clients/s3');
      const sinon = require('sinon');
      const getObject = S3.prototype.getObject = sinon.stub();
      getObject.withArgs({ Bucket: 'invalidBucket', Key: 'invalidKey' }).returns({
        promise: () => Promise.reject({
          code: 500,
          message: 'SimulatedInvalidParameterException',
        }),
      });
      // Act
      const imageHandler = new ImageHandler();
      // Assert
      imageHandler.getOverlayImage('invalidBucket', 'invalidKey').then((result) => {
        assert.equal(typeof result, Error);
      }).catch((err) => {
        console.log(err);
      });
    });
  });
});

// ----------------------------------------------------------------------------
// [async] getCropArea()
// ----------------------------------------------------------------------------
describe('getCropArea()', () => {
  describe('001/validParameters', () => {
    it(`Should pass if the crop area can be calculated using a series of
            valid inputs/parameters`, () => {
      // Arrange
      const boundingBox = {
        Height: 0.18,
        Left: 0.55,
        Top: 0.33,
        Width: 0.23,
      };
      const options = { padding: 20 };
      const metadata = {
        width: 200,
        height: 400,
      };
      // Act
      const imageHandler = new ImageHandler();
      const result = imageHandler.getCropArea(boundingBox, options, metadata);
      // Assert
      const expectedResult = {
        left: 90,
        top: 112,
        width: 86,
        height: 112,
      };
      assert.deepEqual(result, expectedResult);
    });
  });
});

// ----------------------------------------------------------------------------
// [async] getBoundingBox()
// ----------------------------------------------------------------------------
describe('getBoundingBox()', () => {
  describe('001/validParameters', () => {
    it('Should pass if the proper parameters are passed to the function',
      async () => {
        // Arrange
        const sinon = require('sinon');
        const rekognition = require('aws-sdk/clients/rekognition');
        const detectFaces = rekognition.prototype.detectFaces = sinon.stub();
        // ----
        const imageBytes = Buffer.from('TestImageData');
        detectFaces.withArgs({ Image: { Bytes: imageBytes } }).returns({
          promise: () => ({
            FaceDetails: [{
              BoundingBox: {
                Height: 0.18,
                Left: 0.55,
                Top: 0.33,
                Width: 0.23,
              },
            }],
          }),
        });
        // ----
        const currentImage = imageBytes;
        const faceIndex = 0;
        // Act
        const imageHandler = new ImageHandler();
        const result = await imageHandler.getBoundingBox(currentImage, faceIndex);
        // Assert
        const expectedResult = {
          Height: 0.18,
          Left: 0.55,
          Top: 0.33,
          Width: 0.23,
        };
        assert.deepEqual(result, expectedResult);
      });
  });
  describe('002/errorHandling', () => {
    it('Should simulate an error condition returned by Rekognition',
      async () => {
        // Arrange
        const rekognition = require('aws-sdk/clients/rekognition');
        const sinon = require('sinon');
        const detectFaces = rekognition.prototype.detectFaces = sinon.stub();
        detectFaces.returns({
          promise: () => Promise.reject({
            code: 500,
            message: 'SimulatedError',
          }),
        });
        // ----
        const currentImage = Buffer.from('NotTestImageData');
        const faceIndex = 0;
        // Act
        const imageHandler = new ImageHandler();
        // Assert
        imageHandler.getBoundingBox(currentImage, faceIndex).then((result) => {
          assert.equal(typeof result, Error);
        }).catch((err) => {
          console.log(err);
        });
      });
  });
});
