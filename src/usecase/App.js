import React from 'react-native';
import { connect } from 'react-redux/native';

import SideMenu from 'react-native-side-menu';

let {
    Component,
    View,
    Text,
    StyleSheet,
    } = React;

import { changeCurrentBuffer } from './buffers/actions/BufferActions';

import BufferView from './buffers/ui/BufferView';
import BufferList from './buffers/ui/BufferList';

class App extends Component {

    changeCurrentBuffer(bufferName) {
        this.props.dispatch(changeCurrentBuffer(bufferName));
    }
    render() {
        let { buffers, currentBufferName } = this.props;

        return (
            <View style={styles.container}>
                <View style={styles.topbar} />
                <SideMenu touchToClose={true} menu={<BufferList buffers={buffers}
                        currentBufferName={currentBufferName}
                        onSelectBuffer={(b) => this.changeCurrentBuffer(b.name)} />}>
                    <BufferView bufferName={currentBufferName}/>
                </SideMenu>
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
        height: 20,
        backgroundColor: '#001'
    },
    container: {
        flex: 1,
        backgroundColor: '#89a'
    }
});