import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConvertScreen() {
  const handlePress = (source) => {
    console.log(`${source} button pressed`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Convert to PDF</Text>
        <Text style={styles.subtitle}>Choose a source to convert your files!</Text>

        <View style={styles.buttonContainer}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#3b82f6' }]}
              onPress={() => handlePress('Camera')}
            >
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#a855f7' }]}
              onPress={() => handlePress('Gallery')}
            >
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#22c55e' }]}
              onPress={() => handlePress('Files')}
            >
              <Text style={styles.buttonText}>Files</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#06b6d4' }]}
              onPress={() => handlePress('iCloud')}
            >
              <Text style={styles.buttonText}>iCloud</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#f97316' }]}
              onPress={() => handlePress('URL Link')}
            >
              <Text style={styles.buttonText}>URL Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#ec4899' }]}
              onPress={() => handlePress('Other App')}
            >
              <Text style={styles.buttonText}>Other App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
