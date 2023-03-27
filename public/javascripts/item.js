const Item = {
  init(id, type, imagePath, title, spring, summer, fall, winter, dirty, damaged) {
    this.id = id;
    this.type = type;
    this.imagePath = imagePath;
    this.title = title;
    this.spring = spring;
    this.summer = summer;
    this.fall = fall;
    this.winter = winter;
    this.dirty = dirty;
    this.damaged = damaged;

    return this;
  },
};