import test from 'node:test';
import assert from 'node:assert/strict';
import {cloudinaryImage,deliveryVideo,videoPoster} from '../lib/mediaDelivery.js';

test('responsive delivery preserves the asset ID and applies sizing after existing transforms',()=>{
    const source='https://res.cloudinary.com/church/image/upload/c_fill,w_2000/v123/dayspring/a%20photo.jpg';
    const result=cloudinaryImage({src:source,width:640});
    assert.equal(result,'https://res.cloudinary.com/church/image/upload/c_fill,w_2000/c_limit,w_640/q_auto:good/f_auto/v123/dayspring/a%20photo.jpg');
    assert.equal(source.includes('q_auto'),false);
    assert.match(cloudinaryImage({src:'https://res.cloudinary.com/church/image/upload/dayspring/photo.jpg',width:320}),/c_limit,w_320\/q_auto:good\/f_auto\/dayspring\/photo.jpg$/);
});
test('signed, authenticated, query-bearing and unrelated URLs remain intact',()=>{
    for(const src of ['https://res.cloudinary.com/church/image/upload/s--signature--/v123/photo.jpg','https://res.cloudinary.com/church/image/authenticated/v123/photo.jpg','https://res.cloudinary.com/church/image/upload/photo.jpg?token=secret','https://example.com/photo.jpg','/logo.png'])assert.equal(cloudinaryImage({src,width:640}),src);
    assert.equal(deliveryVideo('https://res.cloudinary.com/church/video/upload/s--signature--/v123/clip.mp4'),'https://res.cloudinary.com/church/video/upload/s--signature--/v123/clip.mp4');
});
test('video renditions and posters retain the original asset without changing unknown links',()=>{
    const src='https://res.cloudinary.com/church/video/upload/v123/events/trailer.mp4';
    assert.match(deliveryVideo(src),/c_limit,w_1280\/q_auto\/f_mp4,vc_h264\/v123\/events\/trailer.mp4$/);
    assert.match(videoPoster(src),/so_0\/c_limit,w_960\/q_auto\/f_jpg\/v123\/events\/trailer.jpg$/);
    assert.equal(videoPoster('https://example.com/movie.mp4'),undefined);
    assert.equal(deliveryVideo('/movie.mp4'),'/movie.mp4');
});
