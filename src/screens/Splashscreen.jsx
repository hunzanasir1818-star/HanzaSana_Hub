import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default class SplashScreen extends React.Component {
  state = {
    fadeAnim: new Animated.Value(0),
    slideAnim: new Animated.Value(height * 0.3),
    scaleAnim: new Animated.Value(0.9)
  };

  componentDidMount() {
    Animated.parallel([
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(this.state.slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true
      }),
      Animated.spring(this.state.scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true
      })
    ]).start();
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        {/* Background Gradient Layer */}
        <View style={styles.backgroundGradient} />
        
        {/* Animated Content */}
        <Animated.View style={[
          styles.content,
          {
            opacity: this.state.fadeAnim,
            transform: [
              { translateY: this.state.slideAnim },
              { scale: this.state.scaleAnim }
            ]
          }
        ]}>
          {/* Centered Content */}
          <View style={styles.centerContainer}>
            <Text style={styles.mainText}>
              The Right Way To
            </Text>
            <Text style={styles.mainTexts}>
              <Text style={styles.highlightText}>Transfer Files</Text>
            </Text>
            
            <Image 
              source={require("../../assets/vector.png")} 
              style={styles.itemImage} 
              resizeMode="contain" 
            />
            
            <Text style={styles.subText}>
              Easy, fast and secure way
            </Text>
            <Text style={styles.subText}>
              to transfer large files
            </Text>
          </View>
        </Animated.View>

        {/* Bottom Button (not animated) */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => this.props.navigation.navigate('LoginPINPassword')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    height: height * 0.25, // Reduced from 0.6 to 0.5
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  centerContainer: {
    alignItems: 'center',
  },
  mainText: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#fff',
    lineHeight: 40,
  },
  mainTexts: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#4CAF50',
    lineHeight: 40,
  },
  highlightText: {
    color: '#fff',
   
  },
  itemImage: {
    width: 300,
    height: 300,
    marginVertical: 30,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 5,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});