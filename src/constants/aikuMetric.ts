import {Dimensions, Platform} from 'react-native';

const {width: WINDOW_WIDTH, height: WINDOW_HEIGHT} = Dimensions.get('window');
const actualWidth = WINDOW_WIDTH > WINDOW_HEIGHT ? WINDOW_HEIGHT : WINDOW_WIDTH;
const actualHeight = WINDOW_WIDTH > WINDOW_HEIGHT ? WINDOW_WIDTH : WINDOW_HEIGHT;

const isIOS = Platform.OS === 'ios';

const baseWidth = isIOS ? 428 : 412;
const baseHeight = isIOS ? 926 : 915;

const widthRem = actualWidth / baseWidth;
const heightRem = actualHeight / baseHeight;
const rem = Math.min(widthRem, heightRem); // Use the smaller scale factor to prevent overflow

const scale = (size: number) => Math.round(size * widthRem);
const verticalScale = (size: number) => Math.round(size * heightRem);
const moderateScale = (size: number, factor: number = 0.5) => {
  return Math.round(size + (scale(size) - size) * factor);
};

const platformValues = {
  tabBarHeight: isIOS ? rem * 60 : rem * 56,
  statusBarHeight: isIOS ? rem * 44 : rem * 24,
  bottomSpacing: isIOS
    ? actualHeight / actualWidth > 2.1
      ? rem * 34
      : rem * 20
    : rem * 16,
  navigationBarHeight: isIOS ? rem * 44 : rem * 56,
  menuWidth: Math.min(actualWidth * 0.85, 400), // Maximum menu width of 400 or 85% of screen width
};

const metrics = {
  WIDTH: actualWidth,
  HEIGHT: actualHeight,
  rem,
  widthRem,
  heightRem,
  isIOS,

  statusBarHeight: platformValues.statusBarHeight,
  navigationBarHeight: platformValues.navigationBarHeight,
  bottomSpacing: platformValues.bottomSpacing,
  menuWidth: platformValues.menuWidth,

  margin: {
    xs: rem * 4,
    sm: rem * 8,
    md: rem * 16,
    lg: rem * 24,
    xl: rem * 32,
    xxl: rem * 40,
    xxs: rem * 2,
  },

  padding: {
    xs: rem * 4,
    sm: rem * 8,
    md: rem * 16,
    lg: rem * 24,
    xl: rem * 32,
    xxl: rem * 40,
    xxs: rem * 2,
  },

  fontSize: {
    xs: rem * 12,
    sm: rem * 14,
    md: rem * 16,
    lg: rem * 18,
    xl: rem * 20,
    xxl: rem * 24,
    xxxl: rem * 32,
  },

  borderRadius: {
    xs: rem * 4,
    sm: rem * 8,
    md: rem * 12,
    lg: rem * 16,
    xl: rem * 24,
    circle: rem * 999,
  },

  tabBar: {
    height: platformValues.tabBarHeight,
    iconSize: rem * 24,
    paddingBottom: isIOS
      ? actualHeight / actualWidth > 2.1
        ? rem * 20
        : rem * 15
      : rem * 12,
    marginBottom: isIOS
      ? actualHeight / actualWidth > 2.1
        ? -(rem * 55)
        : -(rem * 45)
      : -(rem * 40),
    paddingHorizontal: rem * 12,
    activeIconSize: isIOS ? rem * 48 : rem * 44,
  },

  scale,
  verticalScale,
  moderateScale,
  getHeightPercentage: (percentage: number) =>
    actualHeight * (percentage / 100),
  getWidthPercentage: (percentage: number) => 
    Math.min(actualWidth * (percentage / 100), platformValues.menuWidth),

  isSmallDevice: actualHeight < 667,
  isMediumDevice: actualHeight >= 667 && actualHeight < 896,
  isLargeDevice: actualHeight >= 896,
  hasNotch: isIOS && actualHeight / actualWidth > 2.1,

  spacing: {
    unit: rem * 8,
    get xxs() {
      return this.unit * 0.25;
    },
    get xs() {
      return this.unit * 0.5;
    },
    get sm() {
      return this.unit;
    },
    get md() {
      return this.unit * 2;
    },
    get lg() {
      return this.unit * 3;
    },
    get xl() {
      return this.unit * 4;
    },
    get xxl() {
      return this.unit * 5;
    },
  },
};

export default metrics;
