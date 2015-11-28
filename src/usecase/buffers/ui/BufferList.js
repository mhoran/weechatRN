import React from 'react-native';

const {
    Component,
    StyleSheet,
    Dimensions,
    Text,
    TouchableHighlight,
    ScrollView,
    View,
    } = React;

export default class BufferList extends Component {
    render() {
        let { buffers, onSelectBuffer, currentBufferName } = this.props;

        let buffersList = Object.keys(buffers).map(key => buffers[key]);

        return (
            <View style={styles.container}>
                <ScrollView style={styles.container}>
                    {buffersList.map(buffer => (
                        <TouchableHighlight key={buffer.name}
                                            onPress={() => onSelectBuffer(buffer)}
                                            underlayColor="#F2777A"
                                            style={[
                                                styles.listItem,
                                                currentBufferName === buffer.name ? {backgroundColor: '#F2777A'} : null
                                            ]}>
                            <View style={styles.row}>
                                <View style={styles.bufferName}>
                                    <Text style={[
                                        styles.listItemText,
                                        currentBufferName !== buffer.name ? {color: '#888'} : null
                                        ]}>{buffer.name}</Text>
                                </View>
                                <Text style={styles.listItemText}>1</Text>
                            </View>
                        </TouchableHighlight>
                    ))}
                </ScrollView>
            </View>
        );
    }
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        height: height,
        width: width,
        paddingRight: width * 0.2,
        flex: 1,
        backgroundColor: '#121212'
    },
    row: {
        flexDirection: 'row',
    },
    bufferName: {
        flex: 1,
    },
    listItem: {
        flex: 1,
        paddingRight: width * 0.4,
        height: 40,
        paddingLeft: 10,
        justifyContent: 'center',
    },
    listItemText: {
        color: '#eee',
        fontFamily: 'Thonburi',
        fontWeight: 'bold',
        fontSize: 15
    }
});