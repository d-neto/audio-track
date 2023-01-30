class AudioTrack extends HTMLElement {
    shadow;
    audio = document.createElement("audio");

    html_elements = {
        element: null,
        player: null,
        col_options: null,
        col_controls: null,
        container_options: null,
        container_slider: null,
        input_slider: null,
        audio_timing: null,
        play_button: null,
    };

    colors = {
        background: "whitesmoke",

        btn_color_1: "#232323",
        btn_color_2: "#111111",

        slider_color_1: "#888",
        slider_color_2: "#888",
        slider_color_3: "#555",
    };

    events = {
        moving_slider: false,
        show_options: false,
        slider_range_interval: null,
    };

    configs = {
        disable_audio: false,
        audio_speed: 1,
        audio_state: "paused",
        style_src_path: "",
    };

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "closed" });

        this.audio.src = this.source;
        this.createAudioElemet();
        this.behaviors();
    }

    connectedCallback() {
        this.render();

        if (!this.source) this.disableComponent();

        this.audio.addEventListener("loadedmetadata", () => {
            this.enableComponent();
            this.loadAudioTrack();
        });

        this.audio.addEventListener("error", (err) => {
            this.disableComponent();
        });

        this.audio.addEventListener("ended", (err) => {
            this.configs.audio_state = "paused";
            this.changePlayPauseButtonState();
        });

        this.audio.addEventListener("play", () => {
            if (typeof MediaSessionControl != "undefined")
                MediaSessionControl.obj.playbackState = "playing";
        });

        this.audio.addEventListener("pause", () => {
            if (typeof MediaSessionControl != "undefined")
                MediaSessionControl.obj.playbackState = "paused";
        });
    }

    static get observedAttributes() {
        return [
            "source",
            "icon-color",
            "options",
            "color",
            "background",
            "link",
            "artist",
            "artwork",
            "audio-title",
            "album",
        ];
    }
    get color() {
        return this.getAttribute("color");
    }
    get source() {
        return this.getAttribute("source");
    }
    get iconColors() {
        return this.getAttribute("icon-color");
    }
    get options() {
        return this.getAttribute("options");
    }
    get title() {
        return this.getAttribute("audio-title") || "";
    }
    get artist() {
        return this.getAttribute("artist") || "";
    }
    get album() {
        return this.getAttribute("album") || "";
    }
    get artwork() {
        return this.getAttribute("artwork") || "";
    }
    get background() {
        return this.getAttribute("background") || "";
    }
    get externalLink() {
        return this.getAttribute("link") || "";
    }

    get playButtonSvg() {
        return `
            <svg class="play-icon" width="48px" height="48px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.4" d="M11.9707 22C17.4936 22 21.9707 17.5228 21.9707 12C21.9707 6.47715 17.4936 2 11.9707 2C6.44786 2 1.9707 6.47715 1.9707 12C1.9707 17.5228 6.44786 22 11.9707 22Z" fill="${this.colors.btn_color_1}"></path> <path d="M14.9694 10.2301L12.0694 8.56012C11.3494 8.14012 10.4794 8.14012 9.75938 8.56012C9.03938 8.98012 8.60938 9.72012 8.60938 10.5601V13.9101C8.60938 14.7401 9.03938 15.4901 9.75938 15.9101C10.1194 16.1201 10.5194 16.2201 10.9094 16.2201C11.3094 16.2201 11.6994 16.1201 12.0594 15.9101L14.9594 14.2401C15.6794 13.8201 16.1094 13.0801 16.1094 12.2401C16.1294 11.4001 15.6994 10.6501 14.9694 10.2301Z" fill="${this.colors.btn_color_1}"></path> </g></svg>
        `;
    }
    get pauseButtonSvg() {
        return `
            <svg class="pause-icon hidden" width="48px" height="48px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.4" d="M11.9707 22C17.4936 22 21.9707 17.5228 21.9707 12C21.9707 6.47715 17.4936 2 11.9707 2C6.44786 2 1.9707 6.47715 1.9707 12C1.9707 17.5228 6.44786 22 11.9707 22Z" fill="${this.colors.btn_color_1}"></path> <path d="M10.72 15.0298V8.9698C10.72 8.4898 10.52 8.2998 10.01 8.2998H8.71C8.2 8.2998 8 8.4898 8 8.9698V15.0298C8 15.5098 8.2 15.6998 8.71 15.6998H10C10.52 15.6998 10.72 15.5098 10.72 15.0298Z" fill="${this.colors.btn_color_1}"></path> <path d="M15.9991 15.0298V8.9698C15.9991 8.4898 15.7991 8.2998 15.2891 8.2998H13.9991C13.4891 8.2998 13.2891 8.4898 13.2891 8.9698V15.0298C13.2891 15.5098 13.4891 15.6998 13.9991 15.6998H15.2891C15.7991 15.6998 15.9991 15.5098 15.9991 15.0298Z" fill="${this.colors.btn_color_1}"></path> </g></svg>
        `;
    }
    get audioMuteButtonSvg() {
        return `
            <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18.0003 16.7498C17.8403 16.7498 17.6903 16.6998 17.5503 16.5998C17.2203 16.3498 17.1503 15.8798 17.4003 15.5498C18.9703 13.4598 18.9703 10.5398 17.4003 8.44978C17.1503 8.11978 17.2203 7.64978 17.5503 7.39978C17.8803 7.14978 18.3503 7.21978 18.6003 7.54978C20.5603 10.1698 20.5603 13.8298 18.6003 16.4498C18.4503 16.6498 18.2303 16.7498 18.0003 16.7498Z" fill="${this.colors.btn_color_1}"></path> <path d="M19.8304 19.2498C19.6704 19.2498 19.5204 19.1998 19.3804 19.0998C19.0504 18.8498 18.9804 18.3798 19.2304 18.0498C21.9004 14.4898 21.9004 9.50978 19.2304 5.94978C18.9804 5.61978 19.0504 5.14978 19.3804 4.89978C19.7104 4.64978 20.1804 4.71978 20.4304 5.04978C23.5004 9.13978 23.5004 14.8598 20.4304 18.9498C20.2904 19.1498 20.0604 19.2498 19.8304 19.2498Z" fill="${this.colors.btn_color_1}"></path> <path opacity="0.4" d="M15.75 7.41021V16.5902C15.75 18.3102 15.13 19.6002 14.02 20.2202C13.57 20.4702 13.07 20.5902 12.55 20.5902C11.75 20.5902 10.89 20.3202 10.01 19.7702L7.09 17.9402C6.89 17.8202 6.66 17.7502 6.43 17.7502H5.5V6.25021H6.43C6.66 6.25021 6.89 6.18021 7.09 6.06021L10.01 4.23021C11.47 3.32021 12.9 3.16021 14.02 3.78021C15.13 4.40021 15.75 5.69021 15.75 7.41021Z" fill="${this.colors.btn_color_1}"></path> <path d="M5.5 6.25V17.75H5C2.58 17.75 1.25 16.42 1.25 14V10C1.25 7.58 2.58 6.25 5 6.25H5.5Z" fill="${this.colors.btn_color_1}"></path> </g></svg>
        `;
    }
    get audioUnmuteButtonSvg() {
        return `
            <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18.0003 16.7498C17.8403 16.7498 17.6903 16.6998 17.5503 16.5998C17.2203 16.3498 17.1503 15.8798 17.4003 15.5498C18.6603 13.8698 18.9303 11.6398 18.1203 9.70983C17.9603 9.32983 18.1403 8.88983 18.5203 8.72983C18.9003 8.56983 19.3403 8.74983 19.5003 9.12983C20.5203 11.5498 20.1703 14.3598 18.6003 16.4598C18.4503 16.6498 18.2303 16.7498 18.0003 16.7498Z" fill="${this.colors.btn_color_1}"></path> <path d="M19.8304 19.2502C19.6704 19.2502 19.5204 19.2002 19.3804 19.1002C19.0504 18.8502 18.9804 18.3802 19.2304 18.0502C21.3704 15.2002 21.8404 11.3802 20.4604 8.0902C20.3004 7.7102 20.4804 7.2702 20.8604 7.1102C21.2404 6.9502 21.6804 7.1302 21.8404 7.5102C23.4304 11.2902 22.8904 15.6702 20.4304 18.9502C20.2904 19.1502 20.0604 19.2502 19.8304 19.2502Z" fill="${this.colors.btn_color_1}"></path> <path opacity="0.4" d="M14.0405 12.96C14.6705 12.33 15.7505 12.78 15.7505 13.67V16.6C15.7505 18.32 15.1305 19.61 14.0205 20.23C13.5705 20.48 13.0705 20.6 12.5505 20.6C11.7505 20.6 10.8905 20.33 10.0105 19.78L9.37047 19.38C8.83047 19.04 8.74047 18.28 9.19047 17.83L14.0405 12.96Z" fill="${this.colors.btn_color_1}"></path> <path opacity="0.4" d="M14.02 3.78021C12.9 3.16021 11.47 3.32021 10.01 4.23021L7.09 6.06021C6.89 6.18021 6.66 6.25021 6.43 6.25021H5.5H5C2.58 6.25021 1.25 7.58021 1.25 10.0002V14.0002C1.25 16.4202 2.58 17.7502 5 17.7502H5.5H6.25L15.75 8.25021V7.41021C15.75 5.69021 15.13 4.40021 14.02 3.78021Z" fill="${this.colors.btn_color_1}"></path> <path d="M21.7709 2.22988C21.4709 1.92988 20.9809 1.92988 20.6809 2.22988L2.23086 20.6899C1.93086 20.9899 1.93086 21.4799 2.23086 21.7799C2.38086 21.9199 2.57086 21.9999 2.77086 21.9999C2.97086 21.9999 3.16086 21.9199 3.31086 21.7699L21.7709 3.30988C22.0809 3.00988 22.0809 2.52988 21.7709 2.22988Z" fill="${this.colors.btn_color_1}"></path> </g></svg>
        `;
    }
    get linkButtonSvg() {
        return `
            <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19.0693 14.2401C18.7793 14.5301 18.3193 14.5301 18.0393 14.2401C17.7493 13.9501 17.7493 13.4901 18.0393 13.2101C20.0393 11.2101 20.0393 7.9601 18.0393 5.9701C16.0393 3.9801 12.7893 3.9701 10.7993 5.9701C8.8093 7.9701 8.7993 11.2201 10.7993 13.2101C11.0893 13.5001 11.0893 13.9601 10.7993 14.2401C10.5093 14.5301 10.0493 14.5301 9.7693 14.2401C7.1993 11.6701 7.1993 7.4901 9.7693 4.9301C12.3393 2.3701 16.5193 2.3601 19.0793 4.9301C21.6393 7.5001 21.6393 11.6701 19.0693 14.2401Z" fill="${this.colors.btn_color_1}"></path> <path opacity="0.4" d="M19.0695 4.92994C21.6395 7.49994 21.6395 11.6699 19.0695 14.2399C18.1895 15.1199 17.1095 15.6999 15.9795 15.9799C16.5095 13.8199 15.9295 11.4499 14.2395 9.75994C12.5495 8.06994 10.1795 7.48994 8.01953 8.01994C8.29953 6.88994 8.86953 5.80994 9.75953 4.92994C12.3295 2.35994 16.4995 2.35994 19.0695 4.92994Z" fill="${this.colors.btn_color_1}"></path> <path d="M4.9307 9.75998C5.2207 9.46998 5.68071 9.46998 5.96071 9.75998C6.25071 10.05 6.25071 10.51 5.96071 10.79C3.96071 12.79 3.96071 16.04 5.96071 18.03C7.9607 20.02 11.2107 20.03 13.2007 18.03C15.1907 16.03 15.2007 12.78 13.2007 10.79C12.9107 10.5 12.9107 10.04 13.2007 9.75998C13.4907 9.46998 13.9507 9.46998 14.2307 9.75998C16.8007 12.33 16.8007 16.51 14.2307 19.07C11.6607 21.63 7.48071 21.64 4.92071 19.07C2.36071 16.5 2.3607 12.33 4.9307 9.75998Z" fill="${this.colors.btn_color_1}"></path> <path opacity="0.5" d="M14.2395 9.75988C15.9295 11.4499 16.5095 13.8199 15.9795 15.9799C15.6995 17.1099 15.1195 18.1899 14.2395 19.0699C11.6695 21.6399 7.49945 21.6399 4.92945 19.0699C2.35945 16.4999 2.35945 12.3299 4.92945 9.75988C5.80945 8.86988 6.88945 8.29988 8.01945 8.01988C10.1795 7.48988 12.5495 8.06988 14.2395 9.75988Z" fill="${this.colors.btn_color_1}"></path> </g></svg>
        `;
    }

    attributeChangedCallback(prop, oldValue, newValue) {
        if (prop == "color") {
            if (newValue.includes("#") && newValue.length > 3) {
                this.changeColor(newValue);
            }
        }
        if (prop == "background") {
            this.colors.background = newValue;
            this.changeBackgroundColor();
        }
        if (prop == "link") {
            if (this.externalLink)
                this.html_elements.container_slider
                    .querySelector("#external-link-btn")
                    .classList.remove("hidden");
            else
                this.html_elements.container_slider
                    .querySelector("#external-link-btn")
                    .classList.add("hidden");

            this.html_elements.container_slider.querySelector(
                "#external-link-btn"
            ).onclick = () => {
                window.open(this.externalLink, "__blank");
            };
        }

        if (prop == "source") {
            this.audio.src = this.source;
        }

        if (
            prop == "options" &&
            (newValue == "" || newValue == true || newValue == "true")
        ) {
            this.html_elements.container_options.classList.remove("hidden");
            this.html_elements.col_options.classList.remove("hidden");
        } else if (prop == "options" && newValue != true) {
            this.events.show_options = false;
            this.html_elements.container_options.classList.add("hidden");
            this.html_elements.col_options.classList.add("hidden");

            this.html_elements.container_slider.querySelectorAll(
                ".section"
            )[0].style.marginTop = "0";
        }

        if (
            typeof MediaSessionControl != "undefined" &&
            this.audio &&
            (prop == "artist" ||
                prop == "album" ||
                prop == "audio-title" ||
                prop == "artwork")
        ) {
            MediaSessionControl.updateMetadata({
                title: this.title,
                artist: this.artist,
                album: this.album,
                artwork: this.artwork,
            });
        }
    }

    render() {
        this.html_elements.player.style.maxWidth = "265px";
        this.styles();
        this.shadow.append(this.html_elements.player);
    }

    disableComponent() {
        clearInterval(this.events.slider_range_interval);
        this.changeDurationTime(0, 0);
        this.html_elements.input_slider.value = 0;
        this.setSliderTo(0);
        this.configs.audio_state = "paused";
        this.changePlayPauseButtonState();
        this.shadow.querySelector(".player").classList.add("error");
    }
    enableComponent() {
        this.shadow.querySelector(".player").classList.remove("error");
    }

    createAudioElemet() {
        let html = `
            <div class="player">
                <div class="top-icons">
                    <span class="hidden">${this.audioUnmuteButtonSvg}</span>
                    <span class="hidden"><p>${this.configs.audio_speed}x</p></span>
                </div>
                <button class="play-button">
                    ${this.playButtonSvg}
                    ${this.pauseButtonSvg}
                </button>
                <div class="col-controls">
                    <div class="slider-container">
                        <div class="scroll">
                            <div class="section" style="margin-top: 0px;">
                                <input class="slider-input" type="range" min="0" max="100" style="--SLIDER-THUMB-COLOR:#555555; background: linear-gradient(to right, rgb(136, 136, 136) 0%, rgb(136, 136, 136) 55%, rgba(255, 255, 255, 0.133) 55%, rgba(255, 255, 255, 0.133) 100%);">
                                <div class="time-range">
                                    <span class="current-time">2:09</span>
                                    <span class="end-time">3:54</span>
                                </div>
                            </div>
                            <div class="section">
                                <div class="audio-options hidden">
                                    <button id="disable-audio-btn" class="btn-option">
                                        ${this.audioMuteButtonSvg}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-options hidden">
                    <div class="options">
                        <div class="dots"></div>
                        <div class="dots"></div>
                        <div class="dots"></div>
                    </div>
                </div>
            </div>
        `;
        this.html_elements.element = new DOMParser().parseFromString(
            html,
            "text/html"
        );
        this.html_elements.player =
            this.html_elements.element.querySelector(".player");

        this.html_elements.col_controls =
            this.html_elements.element.querySelector(".col-controls");
        this.html_elements.col_options =
            this.html_elements.element.querySelector(".col-options");

        this.html_elements.play_button =
            this.html_elements.element.querySelector(".play-button");
        this.html_elements.container_slider =
            this.html_elements.col_controls.querySelector(".slider-container");
        this.html_elements.input_slider =
            this.html_elements.container_slider.querySelector(".slider-input");
        this.html_elements.audio_timing =
            this.html_elements.container_slider.querySelector(".time-range");

        this.html_elements.play_button.innerHTML = `
            ${this.playButtonSvg}
            ${this.pauseButtonSvg}
        `;
        this.html_elements.audio_timing.innerHTML = `
            <span class="current-time">0:00</span>
            <span class="end-time">0:00</span>
        `;

        this.html_elements.input_slider.value = 0;

        this.html_elements.container_options =
            this.html_elements.container_slider.querySelector(".audio-options");
        this.html_elements.container_options.innerHTML = `
            <button id="disable-audio-btn" class="btn-option" title="Disable Sound">
                ${this.audioMuteButtonSvg}
            </button>
            <button id="speed-audio-btn" class="btn-option" title="Audio Speed">
                1x
            </button>
            <button id="external-link-btn" class="btn-option hidden" title="Link">
                ${this.linkButtonSvg}
            </button>
        `;

        this.html_elements.container_slider.querySelector(
            "#external-link-btn"
        ).onclick = () => {
            window.open(this.externalLink, "__blank");
        };
    }

    loadAudioTrack() {
        let min = parseInt(this.audio.duration / 60, 10);
        let secs = parseInt(this.audio.duration % 60).toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
        });

        this.html_elements.audio_timing.querySelector(
            ".current-time"
        ).innerText = `0:00`;
        this.html_elements.audio_timing.querySelector(
            ".end-time"
        ).innerText = `${min}:${secs}`;

        this.html_elements.input_slider.value = this.audio.currentTime;

        if (this.events.slider_range_interval != null) {
            clearInterval(this.events.slider_range_interval);
        }
        this.events.slider_range_interval = setInterval(() => {
            this.rangeSlider();
        }, 100);

        if (typeof MediaSessionControl != "undefined") {
            MediaSessionControl.controlHandler(
                () => {
                    this.toggleAudio();
                },
                () => {
                    this.stopAudio();
                }
            );
            MediaSessionControl.updateMetadata({
                title: this.title,
                artist: this.artist,
                album: this.album,
                artwork: this.artwork,
            });
            MediaSessionControl.updatePositionState(this.audio);
        }
    }

    behaviors() {
        this.html_elements.col_options.querySelector(".options").onclick =
            () => {
                this.toggleOptions();
            };

        this.html_elements.container_options.querySelector(
            "#disable-audio-btn"
        ).onclick = () => {
            this.disabledSound();
        };

        this.html_elements.container_options.querySelector(
            "#speed-audio-btn"
        ).onclick = () => {
            this.changeAudioSpeed();
        };

        this.html_elements.play_button.onclick = () => {
            this.toggleAudio();
        };
        this.html_elements.input_slider.addEventListener("input", () => {
            this.events.moving_slider = true;
            this.updateSliderTrack();
        });
        this.html_elements.input_slider.addEventListener("change", () => {
            this.inputSlider();
            if (typeof MediaSessionControl != "undefined")
                MediaSessionControl.updatePositionState(this.audio);
            this.events.moving_slider = false;
        });

        this.updateSliderTrack();
        this.events.moving_slider = false;
    }

    async toggleAudio() {
        if (this.events.slider_range_interval == null) {
            this.events.slider_range_interval = setInterval(() => {
                this.rangeSlider();
            }, 100);
        }

        Array.from(document.querySelectorAll("audio-track")).forEach((el) => {
            if (el.audio != this.audio) el.stopAudio();
        });

        let metadata = {
            album: this.album,
            title: this.title,
            artist: this.artist,
        };
        if (
            typeof MediaSessionControl != "undefined" &&
            !MediaSessionControl.compareMetadata(metadata)
        ) {
            MediaSessionControl.controlHandler(
                () => {
                    this.toggleAudio();
                },
                () => {
                    this.stopAudio();
                }
            );
            MediaSessionControl.updateMetadata({
                title: this.title,
                artist: this.artist,
                album: this.album,
                artwork: this.artwork,
            });
            MediaSessionControl.updatePositionState(this.audio);
        }

        if (this.configs.audio_state == "paused") {
            await this.audio.play();
            this.configs.audio_state = "playing";
        } else {
            this.audio.pause();
            this.configs.audio_state = "paused";
        }

        this.changePlayPauseButtonState();
    }

    stopAudio() {
        this.audio.pause();
        this.configs.audio_state = "paused";
        this.changePlayPauseButtonState();
    }

    changePlayPauseButtonState() {
        if (this.configs.audio_state == "paused") {
            this.html_elements.play_button
                .querySelector(".play-icon")
                .classList.remove("hidden");
            this.html_elements.play_button
                .querySelector(".pause-icon")
                .classList.add("hidden");
        } else {
            this.html_elements.play_button
                .querySelector(".pause-icon")
                .classList.remove("hidden");
            this.html_elements.play_button
                .querySelector(".play-icon")
                .classList.add("hidden");
        }
    }

    showTopIcons(force = false) {
        let hide_disable_audio =
            this.configs.disable_audio != true ? "hidden" : "";
        let hide_audio_speed = this.configs.audio_speed == 1 ? "hidden" : "";

        this.html_elements.player.querySelector(".top-icons").innerHTML = `
            <span class="${hide_disable_audio}">${this.audioUnmuteButtonSvg}</span>
            <span class="${hide_audio_speed}"><p>${this.configs.audio_speed}x</p></span>
        `;
        if (
            !force &&
            !this.configs.disable_audio &&
            this.configs.audio_speed == 1
        ) {
            this.html_elements.player
                .querySelector(".top-icons")
                .classList.add("fade");

            return;
        }

        this.html_elements.player
            .querySelector(".top-icons")
            .classList.remove("fade");

        if (force)
            this.html_elements.player
                .querySelector(".top-icons")
                .classList.add("fade");
    }

    toggleOptions() {
        this.events.show_options = !this.events.show_options;

        if (this.events.show_options) {
            this.html_elements.container_slider.querySelectorAll(
                ".section"
            )[0].style.marginTop = "-50px";
            this.showTopIcons(this.events.show_options);
        } else {
            this.html_elements.container_slider.querySelectorAll(
                ".section"
            )[0].style.marginTop = "0";
            this.showTopIcons();
        }
    }

    disabledSound() {
        this.configs.disable_audio = !this.configs.disable_audio;
        this.changeIconColorDisableAudio();
    }

    increaseBrightness(hex, percent) {
        hex = hex.replace(/^\s*#|\s*$/g, "");
        if (hex.length == 3) {
            hex = hex.replace(/(.)/g, "$1$1");
        }
        var r = parseInt(hex.substr(0, 2), 16),
            g = parseInt(hex.substr(2, 2), 16),
            b = parseInt(hex.substr(4, 2), 16);

        return (
            "#" +
            (0 | ((256) + r + ((256 - r) * percent) / 100))
                .toString(16)
                .substr(1) +
            (0 | ((256) + g + ((256 - g) * percent) / 100))
                .toString(16)
                .substr(1) +
            (0 | ((256) + b + ((256 - b) * percent) / 100))
                .toString(16)
                .substr(1)
        );
    }

    changeBackgroundColor() {
        this.html_elements.player.style.setProperty(
            "--BACKGROUND-COLOR",
            this.colors.background
        );
    }

    changeColor(color) {
        this.colors.btn_color_1 = color;
        this.colors.btn_color_2 = this.increaseBrightness(color, 10);

        this.colors.slider_color_1 = this.increaseBrightness(color, 10);
        this.colors.slider_color_2 = this.increaseBrightness(color, 30);
        this.colors.slider_color_3 = this.increaseBrightness(color, 20);

        this.html_elements.input_slider.style.setProperty(
            "--SLIDER-THUMB-COLOR",
            this.colors.slider_color_3
        );

        this.html_elements.play_button.innerHTML = `
            ${this.playButtonSvg}
            ${this.pauseButtonSvg}
        `;

        this.changeIconColor();

        this.showTopIcons(this.events.show_options);

        this.changePlayPauseButtonState();
    }

    changeIconColor() {
        this.html_elements.player.style.setProperty(
            "--ICON-COLOR",
            this.colors.btn_color_1
        );

        this.html_elements.container_options.querySelector(
            "#external-link-btn"
        ).innerHTML = `
            ${this.linkButtonSvg}
        `;

        this.changeIconColorDisableAudio();
    }

    changeIconColorDisableAudio() {
        if (this.configs.disable_audio) {
            this.html_elements.container_options
                .querySelector("#disable-audio-btn")
                .classList.add("actived");

            this.html_elements.container_options.querySelector(
                "#disable-audio-btn"
            ).innerHTML = `
                ${this.audioUnmuteButtonSvg}
            `;

            this.audio.muted = true;
        } else {
            this.html_elements.container_options
                .querySelector("#disable-audio-btn")
                .classList.remove("actived");

            this.html_elements.container_options.querySelector(
                "#disable-audio-btn"
            ).innerHTML = `
                ${this.audioMuteButtonSvg}
            `;

            this.audio.muted = false;
        }
    }

    updateSliderTrack() {
        let slider = this.html_elements.input_slider;
        let value = 100 * ((slider.value - slider.min) / (slider.max - slider.min));
        this.setSliderTo(value);

        if (!isNaN(this.audio.duration)) {
            let current_time = this.audio.duration * (this.html_elements.input_slider.value / 100);

            let minutes = parseInt(current_time / 60, 10);
            let seconds = parseInt(current_time % 60).toLocaleString("en-US", {
                minimumIntegerDigits: 2,
                useGrouping: false,
            });
            this.html_elements.audio_timing.querySelector(
                ".current-time"
            ).innerText = `${minutes}:${seconds}`;
        }
    }

    setSliderTo(value) {
        let slider = this.html_elements.input_slider;
        slider.style.background = `linear-gradient(to right, ${this.colors.slider_color_1} 0%,  ${this.colors.slider_color_2} ${value}%, #FFFFFF22 ${value}%, #FFFFFF22 100%)`;
    }

    rangeSlider() {
        if (!isNaN(this.audio.duration)) {
            if (this.events.moving_slider) return;

            let position = this.audio.currentTime * (100 / this.audio.duration);

            this.html_elements.input_slider.value = position;
            this.updateSliderTrack();

            let minutes = parseInt(this.audio.currentTime / 60, 10); //.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
            let seconds = parseInt(this.audio.currentTime % 60).toLocaleString(
                "en-US",
                { minimumIntegerDigits: 2, useGrouping: false }
            );

            this.html_elements.audio_timing.querySelector(
                ".current-time"
            ).innerText = `${minutes}:${seconds}`;
        }
    }

    inputSlider() {
        if (isNaN(this.audio.duration)) return;

        let slider_position =
            this.audio.duration * (this.html_elements.input_slider.value / 100);
        this.audio.currentTime = slider_position;

        let minutes = parseInt(this.audio.currentTime / 60, 10);
        let seconds = parseInt(this.audio.currentTime % 60).toLocaleString(
            "en-US",
            { minimumIntegerDigits: 2, useGrouping: false }
        );

        this.html_elements.audio_timing.querySelector(
            ".current-time"
        ).innerText = `${minutes}:${seconds}`;
    }

    changeDurationTime(init = 0, end = 0) {
        let minutes_init = parseInt(init / 60, 10);
        let seconds_init = parseInt(init % 60).toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
        });

        let minutes_end = parseInt(end / 60, 10);
        let seconds_end = parseInt(end % 60).toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
        });

        this.html_elements.audio_timing.querySelector(
            ".current-time"
        ).innerText = `${minutes_init}:${seconds_init}`;
        this.html_elements.audio_timing.querySelector(
            ".end-time"
        ).innerText = `${minutes_end}:${seconds_end}`;
    }

    changeAudioSpeed() {
        if (this.configs.audio_speed >= 0.25 && this.configs.audio_speed < 2)
            this.configs.audio_speed += 0.25;
        else this.configs.audio_speed = 0.25;

        this.audio.playbackRate = this.configs.audio_speed;

        let fontSize = "0.8em";
        if (this.configs.audio_speed != 1 && this.configs.audio_speed != 2)
            fontSize = "0.5em";

        if (this.configs.audio_speed != 1)
            this.html_elements.container_options
                .querySelector("#speed-audio-btn")
                .classList.add("toggle");
        else
            this.html_elements.container_options
                .querySelector("#speed-audio-btn")
                .classList.remove("toggle");

        this.html_elements.container_options.querySelector(
            "#speed-audio-btn"
        ).style.fontSize = fontSize;

        this.html_elements.container_options.querySelector(
            "#speed-audio-btn"
        ).innerText = `${this.configs.audio_speed}x`;
    }

    async styles() {
        let style = document.createElement("style");

        if (this.configs.style_src_path) {
            style.textContent = `
                *{
                    display: none;
                }
                .player{
                    height: 72px;
                    width: 265px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 0.5em;
                    transition: all .5s ease;
                }
                .player::after{
                    content: 'Loading component...';
                    display: block;
                    font-family: sans-serif;
                    font-size: 0.7em;
                }
            `;

            this.shadow.append(style);
            let style_file = "";
            let status;
            await fetch(this.configs.style_src_path).then(async (response) => {
                status = response.status;
                style_file = await response.text();
                style.textContent = style_file;

                this.shadow.append(style);
            });

            if (status == 200) return;
        }

        style.textContent = `
        *{
            -webkit-tap-highlight-color:  rgba(255, 255, 255, 0); 
        }
        .player{
            --BACKGROUND-COLOR: whitesmoke;
            --ICON-COLOR: #000;
            --DISABLED-COLOR: #DD222299;
            --ENABLED-COLOR: #33FF9999;

            max-height: 72px !important;
            max-width: 265px !important;
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: center;
            align-content: center;
            justify-content: space-around;
            background-color: var(--BACKGROUND-COLOR);
            border-radius: 0.5em;
            transition: all .5s ease;
            border-bottom: 3px solid #0003;
        }

        .col-controls{
            position: relative;

            display: flex;
            flex-direction: row;
            align-items: center;
            align-content: center;
            gap: 0.5em;
            padding: 1em;
            transition: all .5s ease;
        }
        .col-options{
            position: relative;

            padding: 1em 0 1em 0;
            margin-right: 0.5em;
        }
        .play-button{
            background: transparent;
            padding: 0;
            border: none;
            cursor: pointer;
            transition: all .5s ease;
        
            margin-left: 0.5em;
            border-radius: 50%;
        }
        .play-button:hover{
            opacity: 0.8;
        }
    
        .slider-container{
            min-height: 100%;
            transition: all .4s ease;
        }
        
        .scroll{
            display: flex;
            flex-direction: column;
            justify-content: start;
            height: 45px;
            overflow: hidden;
            transition: all .4s ease;
            padding: 0px 2px 0px 2px;
        }
        
        .section{
            padding: 0.1em;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            min-height: 100%;
            transition: all .4s ease;
        }
        
        .slider-input{
            --SLIDER-THUMB-COLOR: #888888;
        
            appearance: none;
            border-radius: 1em;
            height: 0.5em;
            width: 100%;
            background:
            linear-gradient(to right, orange 80%, transparent 80%);
            cursor: pointer;
            transition: all .5s ease;
            box-shadow: inset 0px 0px 10px 2px rgba(0, 0, 0, 0.1);
            -webkit-box-shadow: inset 0px 0px 10px 2px rgba(0, 0, 0, 0.1);
            -moz-box-shadow: inset 0px 0px 10px 2px rgba(0, 0, 0, 0.1);
        }
        .slider-input::-webkit-slider-thumb{
            appearance: none;
            height: 1em;
            width: 1em;
            border-radius: 50%;
            background: var(--SLIDER-THUMB-COLOR);
            border: 1px solid white;
        }
        .slider-input::-moz-range-thumb{
            appearance: none;
            height: 1em;
            width: 1em;
            border-radius: 50%;
            background: var(--SLIDER-THUMB-COLOR);
            border: 1px solid white;
        }
        
        .time-range{
            font-family: Verdana, Geneva, Tahoma, sans-serif;
            font-size: 0.7rem;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            background-color: var(--BACKGROUND-COLOR);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            filter: invert(1) grayscale(1);
            -webkit-filter: invert(1) grayscale(1);
        }
        .options{
            min-width: 20px;
            min-height: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            background-color: transparent;
            padding: 0.5em;
            cursor: pointer;
            transition: all .3s ease;
        }
        .options:hover{
            opacity: 0.7;
            background: rgba(0, 0, 0, 0.2);
            filter: brightness(0.7);
        }
        .dots{
            width: 0.3em;
            height: 0.3em;
            border-radius: 50%;
            margin-bottom: 0.1em;
            background: var(--BACKGROUND-COLOR);
            filter: invert(1) grayscale(1);
            -webkit-filter: invert(1) grayscale(1);
        }
        .audio-options{
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            justify-content: center;
            gap: 1em;
            overflow: hidden;
        }
        .btn-option{
            display: flex;
            justify-content: center;
            align-items: center;
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 50%;
            background: transparent;
            cursor: pointer;
            transition: all .3s linear;
        
            color: var(--ICON-COLOR);
            font-family: Candara, Verdana, Geneva, Tahoma, sans-serif;
            font-size: 0.8em;
            font-weight: 900;
        }
        .actived{
            opacity: 0.9;
            background-color: var(--DISABLED-COLOR) !important;
            color: red !important;
        }
        .toggle{
            opacity: 0.9;
            background-color: var(--ENABLED-COLOR) !important;
        }
        .btn-option:hover{
            opacity: 0.9;
            background: rgba(0, 0, 0, 0.2);
            filter: brightness(0.7);
        }

        .top-icons{
            display: flex;
            align-items: center;
            gap: 10px;

            bottom: 0;
            right: 0;
            padding: 0.2em 0.7em 0.2em 0.7em;
            position: absolute;
            opacity: 1;
            transition: all .2s ease-in;
        }
        .top-icons span p{
            all: unset;
            padding: 0;
            margin: 0;
            display: block;
            font-size: 10px !important;
            font-family: sans-serif;
            
            color: var(--ICON-COLOR) !important;
            font-weight: 600;
        }
        .top-icons span svg{
            height: 12px !important;
            width: 12px !important;
        }

        .fade{
            opacity: 0;
        }
        
        .error{
            background: rgba(255,255,255,0.6) !important;
            opacity: 0.7 !important;
            pointer-events: none !important;
        }
        .error *{
            pointer-events: none !important;
        }
        .hidden{ display: none; }
        `;
        this.shadow.append(style);
    }
}
customElements.define("audio-track", AudioTrack);
