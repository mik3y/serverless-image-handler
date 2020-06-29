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

const assert = require('assert');
const ThumborMapping = require('../thumbor-mapping');

// ----------------------------------------------------------------------------
// process()
// ----------------------------------------------------------------------------
describe('process()', () => {
  describe('001/thumborRequest', () => {
    it(`Should pass if the proper edit translations are applied and in the
            correct order`, () => {
      // Arrange
      const event = {
        path: '/fit-in/200x300/filters:grayscale()/test-image-001.jpg',
      };
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.process(event);
      // Assert
      const expectedResult = {
        edits: {
          resize: {
            width: 200,
            height: 300,
            fit: 'inside',
          },
          grayscale: true,
        },
      };
      assert.deepEqual(thumborMapping.edits, expectedResult.edits);
    });
  });
});

// ----------------------------------------------------------------------------
// parseCustomPath()
// ----------------------------------------------------------------------------
describe('parseCustomPath()', () => {
  describe('001/validPath', () => {
    it(`Should pass if the proper edit translations are applied and in the
            correct order`, () => {
      const event = {
        path: '/filters-rotate(90)/filters-grayscale()/thumbor-image.jpg',
      };
      process.env.REWRITE_MATCH_PATTERN = /(filters-)/gm;
      process.env.REWRITE_SUBSTITUTION = 'filters:';
      // Act
      const thumborMapping = new ThumborMapping();
      const result = thumborMapping.parseCustomPath(event.path);
      // Assert
      const expectedResult = '/filters:rotate(90)/filters:grayscale()/thumbor-image.jpg';
      assert.deepEqual(result.path, expectedResult);
    });
  });
  describe('002/undefinedEnvironmentVariables', () => {
    it('Should throw an error if the environment variables are left undefined', () => {
      const event = {
        path: '/filters-rotate(90)/filters-grayscale()/thumbor-image.jpg',
      };
      process.env.REWRITE_MATCH_PATTERN = undefined;
      process.env.REWRITE_SUBSTITUTION = undefined;
      // Act
      const thumborMapping = new ThumborMapping();
      // Assert
      assert.throws(() => {
        thumborMapping.parseCustomPath(event.path);
      }, Error, 'ThumborMapping::ParseCustomPath::ParsingError');
    });
  });
  describe('003/undefinedPath', () => {
    it('Should throw an error if the path is not defined', () => {
      const event = {};
      process.env.REWRITE_MATCH_PATTERN = /(filters-)/gm;
      process.env.REWRITE_SUBSTITUTION = 'filters:';
      // Act
      const thumborMapping = new ThumborMapping();
      // Assert
      assert.throws(() => {
        thumborMapping.parseCustomPath(event.path);
      }, Error, 'ThumborMapping::ParseCustomPath::ParsingError');
    });
  });
  describe('004/undefinedAll', () => {
    it('Should throw an error if the path is not defined', () => {
      const event = {};
      process.env.REWRITE_MATCH_PATTERN = undefined;
      process.env.REWRITE_SUBSTITUTION = undefined;
      // Act
      const thumborMapping = new ThumborMapping();
      // Assert
      assert.throws(() => {
        thumborMapping.parseCustomPath(event.path);
      }, Error, 'ThumborMapping::ParseCustomPath::ParsingError');
    });
  });
});

// ----------------------------------------------------------------------------
// mapFilter()
// ----------------------------------------------------------------------------
describe('mapFilter()', () => {
  describe('001/autojpg', () => {
    it(`Should pass if the filter is successfully converted from
            Thumbor:autojpg()`, () => {
      // Arrange
      const edit = 'filters:autojpg()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: { toFormat: 'jpeg' },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('002/background_color', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:background_color()`, () => {
      // Arrange
      const edit = 'filters:background_color(ffff)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: { flatten: { background: { r: 255, g: 255, b: 255 } } },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('003/blur/singleParameter', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:blur()`, () => {
      // Arrange
      const edit = 'filters:blur(60)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: { blur: 30 },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('004/blur/doubleParameter', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:blur()`, () => {
      // Arrange
      const edit = 'filters:blur(60, 2)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: { blur: 2 },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('005/convolution', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:convolution()`, () => {
      // Arrange
      const edit = 'filters:convolution(1;2;1;2;4;2;1;2;1,3,true)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          convolve: {
            width: 3,
            height: 3,
            kernel: [1, 2, 1, 2, 4, 2, 1, 2, 1],
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('006/equalize', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:equalize()`, () => {
      // Arrange
      const edit = 'filters:equalize()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: { normalize: 'true' },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('007/fill/resizeUndefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:fill()`, () => {
      // Arrange
      const edit = 'filters:fill(fff)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: { resize: { background: { r: 255, g: 255, b: 255 } } },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });

  describe('008/fill/resizeDefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:fill()`, () => {
      // Arrange
      const edit = 'filters:fill(fff)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.edits.resize = {};
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: { resize: { background: { r: 255, g: 255, b: 255 } } },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('009/format/supportedFileType', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:format()`, () => {
      // Arrange
      const edit = 'filters:format(png)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: { toFormat: 'png' },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('010/format/unsupportedFileType', () => {
    it('Should return undefined if an accepted file format is not specified',
      () => {
        // Arrange
        const edit = 'filters:format(test)';
        const filetype = 'jpg';
        // Act
        const thumborMapping = new ThumborMapping();
        thumborMapping.mapFilter(edit, filetype);
        // Assert
        const expectedResult = {
          edits: { },
        };
        assert.deepEqual(thumborMapping, expectedResult);
      });
  });
  describe('011/no_upscale/resizeUndefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:no_upscale()`, () => {
      // Arrange
      const edit = 'filters:no_upscale()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          resize: {
            withoutEnlargement: true,
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('012/no_upscale/resizeDefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:no_upscale()`, () => {
      // Arrange
      const edit = 'filters:no_upscale()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.edits.resize = {
        height: 400,
        width: 300,
      };
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          resize: {
            height: 400,
            width: 300,
            withoutEnlargement: true,
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('013/proportion/resizeDefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:proportion()`, () => {
      // Arrange
      const edit = 'filters:proportion(0.3)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.edits = {
        resize: {
          width: 200,
          height: 200,
        },
      };
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          resize: {
            height: 60,
            width: 60,
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('014/proportion/resizeUndefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:resize()`, () => {
      // Arrange
      const edit = 'filters:proportion(0.3)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const actualResult = (typeof (thumborMapping.edits.resize) !== undefined);
      const expectedResult = true;
      assert.deepEqual(actualResult, expectedResult);
    });
  });
  describe('015/quality/jpg', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:quality()`, () => {
      // Arrange
      const edit = 'filters:quality(50)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          jpeg: {
            quality: 50,
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('016/quality/png', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:quality()`, () => {
      // Arrange
      const edit = 'filters:quality(50)';
      const filetype = 'png';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          png: {
            quality: 50,
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('017/quality/webp', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:quality()`, () => {
      // Arrange
      const edit = 'filters:quality(50)';
      const filetype = 'webp';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          webp: {
            quality: 50,
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('018/quality/tiff', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:quality()`, () => {
      // Arrange
      const edit = 'filters:quality(50)';
      const filetype = 'tiff';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          tiff: {
            quality: 50,
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('019/quality/heif', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:quality()`, () => {
      // Arrange
      const edit = 'filters:quality(50)';
      const filetype = 'heif';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          heif: {
            quality: 50,
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('020/quality/other', () => {
    it('Should return undefined if an unsupported file type is provided',
      () => {
        // Arrange
        const edit = 'filters:quality(50)';
        const filetype = 'xml';
        // Act
        const thumborMapping = new ThumborMapping();
        thumborMapping.mapFilter(edit, filetype);
        // Assert
        const expectedResult = {
          edits: { },
        };
        assert.deepEqual(thumborMapping, expectedResult);
      });
  });
  describe('021/rgb', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:rgb()`, () => {
      // Arrange
      const edit = 'filters:rgb(10, 10, 10)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          tint: {
            r: 25.5,
            g: 25.5,
            b: 25.5,
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('022/rotate', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:rotate()`, () => {
      // Arrange
      const edit = 'filters:rotate(75)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          rotate: 75,
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('023/sharpen', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:sharpen()`, () => {
      // Arrange
      const edit = 'filters:sharpen(75, 5)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          sharpen: 3.5,
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('024/stretch/default', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:stretch()`, () => {
      // Arrange
      const edit = 'filters:stretch()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          resize: { fit: 'fill' },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('025/stretch/resizeDefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:stretch()`, () => {
      // Arrange
      const edit = 'filters:stretch()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.edits.resize = {};
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          resize: { fit: 'fill' },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('026/stretch/sizingMethodUndefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:stretch()`, () => {
      // Arrange
      const edit = 'filters:stretch()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.edits.resize = {};
      thumborMapping.sizingMethod = undefined;
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          resize: { fit: 'fill' },
        },
        sizingMethod: undefined,
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('027/stretch/sizingMethodNotFitIn', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:stretch()`, () => {
      // Arrange
      const edit = 'filters:stretch()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.edits.resize = {};
      thumborMapping.sizingMethod = 'cover';
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          resize: { fit: 'fill' },
        },
        sizingMethod: 'cover',
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('028/stretch/sizingMethodFitIn', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:stretch()`, () => {
      // Arrange
      const edit = 'filters:stretch()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.edits.resize = {};
      thumborMapping.sizingMethod = 'fit-in';
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          resize: {},
        },
        sizingMethod: 'fit-in',
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('029/strip_exif', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:strip_exif()`, () => {
      // Arrange
      const edit = 'filters:strip_exif()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          rotate: 0,
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('030/strip_icc', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:strip_icc()`, () => {
      // Arrange
      const edit = 'filters:strip_icc()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          rotate: 0,
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('031/upscale', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:upscale()`, () => {
      // Arrange
      const edit = 'filters:upscale()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          resize: {
            fit: 'inside',
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('032/upscale/resizeNotUndefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:upscale()`, () => {
      // Arrange
      const edit = 'filters:upscale()';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.edits.resize = {};
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          resize: {
            fit: 'inside',
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('032/watermark/positionDefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:watermark()`, () => {
      // Arrange
      const edit = 'filters:watermark(bucket,key,100,100,0)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          overlayWith: {
            bucket: 'bucket',
            key: 'key',
            alpha: '0',
            wRatio: undefined,
            hRatio: undefined,
            options: {
              left: '100',
              top: '100',
            },
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('033/watermark/positionDefinedByPercentile', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:watermark()`, () => {
      // Arrange
      const edit = 'filters:watermark(bucket,key,50p,30p,0)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          overlayWith: {
            bucket: 'bucket',
            key: 'key',
            alpha: '0',
            wRatio: undefined,
            hRatio: undefined,
            options: {
              left: '50p',
              top: '30p',
            },
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('034/watermark/positionDefinedWrong', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:watermark()`, () => {
      // Arrange
      const edit = 'filters:watermark(bucket,key,x,x,0)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          overlayWith: {
            bucket: 'bucket',
            key: 'key',
            alpha: '0',
            wRatio: undefined,
            hRatio: undefined,
            options: {},
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('035/watermark/ratioDefined', () => {
    it(`Should pass if the filter is successfully translated from
            Thumbor:watermark()`, () => {
      // Arrange
      const edit = 'filters:watermark(bucket,key,100,100,0,10,10)';
      const filetype = 'jpg';
      // Act
      const thumborMapping = new ThumborMapping();
      thumborMapping.mapFilter(edit, filetype);
      // Assert
      const expectedResult = {
        edits: {
          overlayWith: {
            bucket: 'bucket',
            key: 'key',
            alpha: '0',
            wRatio: '10',
            hRatio: '10',
            options: {
              left: '100',
              top: '100',
            },
          },
        },
      };
      assert.deepEqual(thumborMapping, expectedResult);
    });
  });
  describe('036/elseCondition', () => {
    it('Should pass if undefined is returned for an unsupported filter',
      () => {
        // Arrange
        const edit = 'filters:notSupportedFilter()';
        const filetype = 'jpg';
        // Act
        const thumborMapping = new ThumborMapping();
        thumborMapping.mapFilter(edit, filetype);
        // Assert
        const expectedResult = { edits: {} };
        assert.deepEqual(thumborMapping, expectedResult);
      });
  });
});
