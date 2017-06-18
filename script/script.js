$(document).ready(function () {

    var takePhoto = false;
    var takeCover = false;
    var tokenAccess = null;
    var imageCanvas = null;

    var SetupView = {
        init: function () {
            var self = this;
            setTimeout(function () {
                self.photoBlock();
            }, 500);
        },
        photoBlock: function () {
            var height = $(window).height() - $('.ppFooter').height();
            $('.partPhoto .ppCamera').css('height', height + 'px');
            $('.modCommercial .mcContent .mcImage').css('max-height', $(window).height() - 30 + 'px');
            $(window).resize(function () {
                height = $(window).height() - $('.ppFooter').height();
                $('.partPhoto .ppCamera').css('height', height + 'px');
                $('.modCommercial .mcContent .mcImage').css('max-height', $(window).height() - 30 + 'px');
            });
        }
    };
    SetupView.init();

    var Image = {
        init: function () {
            this.getImage();
        },
        getImage: function () {
            var self = this;
            $("#takePhoto").change(function () {
                self.preview(this);
            });
        },
        preview: function (input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    takePhoto = true;
                    $('#userPhoto').css('display', 'block').attr('src', e.target.result);
                    $('#contTakePhoto').css('display', 'none');
                    $('#textEsp').css('display', 'block');
                    $('.partPhoto .ppCamera').css('height', ($(window).height() - 154) + 'px');
                    $('.partPhoto .ppCamera .panelZoom').css('display', 'block');
                    $('.takePhotoStep .ppfText').html('AHORA PUEDE ESCOGER LA ESPECIALIDAD');
                    SetupView.photoBlock();
                };

                reader.readAsDataURL(input.files[0]);
            }
        },
        screenShot: function () {
            $('.partPhoto .ppCamera .pwFooter').css('display', 'block');
            html2canvas(document.body, {
                onrendered: function (canvas) {
                    var a = document.createElement('a');
                    imageCanvas = canvas.toDataURL('image/jpeg', 1.0);
                    //$('.ppCamera').css('background-image', 'url("' + imageCanvas + '")');
                    $('#resultPhoto').attr('src', imageCanvas).css('display', 'block');
                    $('.ppFooter').css('display', 'block');
                    $('.ppcWrapper').css('display', 'none');
                    $('.wrapperLoader').css('display', 'none');
                    $('.partPhoto .ppCamera').css('overflow-y', 'auto');
                    SetupView.init();

                    $('#saveImage').attr('href', canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream"));
                    $('#saveImage').attr('download', 'Picture.jpg');
                }
            });
        },
        uploadImage: function (token) {
            var blob = this.dataURItoBlob(imageCanvas);
            var formData = new FormData();
            formData.append('access_token', token);
            formData.append('source', blob);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://graph.facebook.com/me/photos', true);
            xhr.onerror = function (res) {
                console.log(xhr.responseText)
            };

            xhr.onload = function (res) {
                $('.wrapperLoader').css('display', 'none');
                $('.modShare').fadeIn(200);
                setTimeout(function () {
                    $('.modShare').fadeOut(200);
                }, 2000);
            };
            xhr.send(formData);
        },
        dataURItoBlob: function () {
            var byteString = atob(imageCanvas.split(',')[1]);
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], {type: 'image/jpeg'});
        }
    };
    Image.init();

    var Events = {
        zoom: 1,
        init: function () {
            this.cleanPhoto();
            this.acceptPhoto();
            this.showPopup();
            this.closePopup();
            this.dragImage();
            this.checkDrag();
            this.changeCover();
            this.zoomIn();
            this.zoomOut();
        },
        zoomIn: function () {
            var self = this;
            $('#zoomP').on('click', function () {
                if (self.zoom < 2) {
                    self.zoom = self.zoom + 0.1;
                    $('#userPhoto').css('-webkit-transform', 'scale('+ self.zoom +')');
                    $('#userPhoto').css('-moz-transform', 'scale('+ self.zoom +')');
                    $('#userPhoto').css('-ms-transform', 'scale('+ self.zoom +')');
                    $('#userPhoto').css('transform', 'scale('+ self.zoom +')');
                }
            });
        },
        zoomOut: function () {
            var self = this;
            $('#zoomM').on('click', function () {
                if (self.zoom > 0.2) {
                    self.zoom = self.zoom - 0.1;
                    $('#userPhoto').css('-webkit-transform', 'scale('+ self.zoom +')');
                    $('#userPhoto').css('-moz-transform', 'scale('+ self.zoom +')');
                    $('#userPhoto').css('-ms-transform', 'scale('+ self.zoom +')');
                    $('#userPhoto').css('transform', 'scale('+ self.zoom +')');
                }
            });
        },
        showPopup: function () {
            $('#showCommercial').on('click', function () {
                $('.modCommercial').fadeIn(200);
            });
        },
        closePopup: function () {
            $('#closeCommercial').on('click', function () {
                $('.modCommercial').fadeOut(200);
            });
        },
        changeCover: function () {
            $('#changeCover').on('click', function () {
                $('#opPhoto').css('display', 'none');
                $('.ppFooter').css('display', 'block');
                SetupView.photoBlock();
            });
        },
        cleanPhoto: function () {
            $('#clearAll').on('click', function () {
                $('#opPhoto').css('display', 'none');
                $('#userPhoto').css('display', 'none');
                $('#coverPhoto').css('display', 'none');
                $('#contTakePhoto').css('display', 'block');
                $('#textEsp').css('display', 'none');
                $('.ppFooter').css('display', 'block');
                $('.partPhoto .ppCamera .panelZoom').css('display', 'none');
                $('.takePhotoStep .ppfText').html('TÓMESE UNA FOTO O ELIJA DESDE SU CARRETE');
                SetupView.init();
                takeCover = false;
                takePhoto = false;
            });
        },
        acceptPhoto: function () {
            $('#acceptAll').on('click', function () {
                if (takeCover == true) {
                    $('.ppFooter .takePhotoStep').css('display', 'none');
                    $('.btnOptions').css('display', 'none');
                    $('.ppFooter .lastStep').css('display', 'block');
                    $('.closeDemo').css('display', 'block');
                    $('.wrapperLoader').css('display', 'block');
                    Image.screenShot();
                }
            });
        },
        dragImage: function () {
            $('#dragPhoto').on('click', function () {
                $('.dragPhoto').css('z-index', '100');
                $('#opZoom').css('display', 'block');
                $('#userPhoto').css({'opacity': '.75', 'z-index': '10'});
                $('#clearAll').css('display', 'none');
                $('#changeCover').css('display', 'none');
                $('#acceptAll').css('display', 'none');
                $('#dragPhoto').css('display', 'none');
                $('#checkDrag').css('display', 'inline-block');
            });
        },
        checkDrag: function () {
            $('#checkDrag').on('click', function () {
                $('.dragPhoto').css('z-index', '1');
                $('#opZoom').css('display', 'none');
                $('#userPhoto').css({'opacity': '1', 'z-index': '1'});
                $('#clearAll').css('display', 'inline-block');
                $('#acceptAll').css('display', 'inline-block');
                $('#dragPhoto').css('display', 'inline-block');
                $('#changeCover').css('display', 'inline-block');
                $('#checkDrag').css('display', 'none');
            });
        }
    };
    Events.init();

    var Facebook = {
        init: function () {
            this.login();
            this.share();
        },
        login: function () {
            $('#loginFacebook').on('click', function () {
                //$('.partHome').fadeOut(200);
                FB.login(function (res) {
                    tokenAccess = res.authResponse.accessToken;
                    $('.partHome').fadeOut(200);
                }, {scope: 'public_profile,publish_actions'});
            });
        },
        share: function () {
            $('#shareFacebook').on('click', function () {
                $('.wrapperLoader').css('display', 'block');
                Image.uploadImage(tokenAccess);
            });
        }
    };
    Facebook.init();

    var CroppieImage = {
        init: function () {
            this.setBackground();
        },
        setBackground: function () {
            $('body').on('click', '.ppfTypes li', function () {
                if (takePhoto == true) {
                    var type = $(this).attr('cat');

                    $('#coverPhoto').attr('src', 'images/new/cover' + type + '.png').css('display', 'block');
                    // $('#coverPhoto').css('background-image', 'url("images/new/cover' + type + '.png")').css('display', 'block');
                    $('.partPhoto .ppCamera').css('height', $(window).height() + 'px');
                    $('.ppFooter').css('display', 'none');
                    $('#opPhoto').css('display', 'block');
                    takeCover = true;
                }
            });

        }
    };
    CroppieImage.init();

});
