import React from 'react';

export default class MultiplePhoto extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            frame: 0,
            isPaused: false,
            direction: 'positive'
        };
    }

    addInterval() {
        if (this.interval)
            clearInterval(this.interval);
        const {direction} = this.state;
        const {frames = []} = this.props;
        this.interval = setInterval(() => this.setState(({frame}) => {
            const isPos = (direction === 'positive');
            if (frame === (isPos ? frames.length - 1 : 0))
                return {frame: (isPos) ? 1 : frames.length - 1};
            else
                return {frame: (isPos) ? frame + 1 : frame - 1};
        }), 150);
    }

    componentDidMount() {
        this.addInterval();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const {frame} = this.state;
        const {frames = []} = this.props;

        return (
            <div className='multiple-photo-container'>
                <img src={frames[frame]} width='200' height='200' alt=''/>
                <div className='back icon angle_left' onClick={() => {
                    this.setState({direction: 'negative'}, this.addInterval);
                }}/>
                <div className='pause' onClick={() => {
                    const {isPaused} = this.state;
                    if (isPaused)
                        this.addInterval();
                    else
                        clearInterval(this.interval);
                    this.setState(({isPaused}) => ({isPaused: !isPaused}));
                }}>PAUSE ICON
                </div>
                <div className='forward icon angle_right' onClick={() => {
                    this.setState({direction: 'positive'}, this.addInterval);
                }}/>
            </div>
        )
    }
}