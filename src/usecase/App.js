import React from 'react-native';
import { connect } from 'react-redux/native';

import Drawer from 'react-native-drawer';

let {
    Component,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    } = React;

import { changeCurrentBuffer } from './buffers/actions/BufferActions';

import BufferView from './buffers/ui/BufferView';
import BufferList from './buffers/ui/BufferList';

class App extends Component {

    changeCurrentBuffer(bufferName) {
        this.props.dispatch(changeCurrentBuffer(bufferName));
        this.drawer.close();
    }
    render() {
        let { buffers, currentBufferName } = this.props;


        let sidebar = (
            <BufferList buffers={buffers}
                        currentBufferName={currentBufferName}
                        onSelectBuffer={(b) => this.changeCurrentBuffer(b.name)} />
        );

        return (
            <View style={styles.container}>
                <Drawer type="static"
                        content={sidebar}
                        panOpenMask={.03}
                        tapToClose={true}
                        openDrawerOffset={100}
                        captureGestures={true}
                        ref={(d) => this.drawer = d}
                        tweenHandler={Drawer.tweenPresets.parallax}>
                    <View style={styles.topbar}>
                        <View style={styles.channels}>
                            <TouchableOpacity style={styles.channelsButton} onPress={() => this.drawer.open()}>
                                <Text style={styles.channelsButtonText}>#</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={styles.topbarText}>{currentBufferName}</Text>
                        </View>
                        <View style={styles.channels}></View>
                    </View>
                    <BufferView bufferName={currentBufferName}/>
                </Drawer>
            </View>
        );
    }
}

export default connect(state => {
    return {
        currentBufferName: state.buffer.currentBufferName,
        buffers: state.buffer.buffers
    };
})(App);

const styles = StyleSheet.create({
    topbar: {
        flexDirection: 'row',
        paddingTop: 20,
        height: 70,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    channels: {
        flex: 1,
        paddingHorizontal: 5,
    },
    channelsButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        width: 40
    },
    channelsButtonText: {
        textAlign: 'center',
        fontSize: 20,
        fontFamily: 'Gill Sans',
        color: '#eee',
        fontWeight: 'bold'
    },
    topbarText: {
        color: '#eee',
        fontFamily: 'Thonburi',
        fontWeight: 'bold',
        fontSize: 15
    },
    container: {
        flex: 1,
        backgroundColor: '#89a'
    }
});