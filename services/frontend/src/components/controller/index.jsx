import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Arrow, Motor } from '../icons';
import styles from './style.module.css';
import motor from './motor.png';
const CancelToken = axios.CancelToken;
let source = CancelToken.source();

const suppressError = err => {
    console.log(err);
};

const Controller = () => {
    const [steps, setSteps] = useState(100);
    const [submitting, setSubmitting] = useState(false);
    const moveMotor = async direction => {
        setSubmitting(true);
        await axios
            .post(
                '/api/calibrate',
                {
                    steps: steps || 1,
                    direction,
                },
                {
                    cancelToken: source.token,
                }
            )
            .catch(suppressError);
        setSubmitting(false);
    };
    const deployMovement = async () => {
        setSubmitting(true);
        await axios
            .get('/api/deploy?awaitCompletion=true', { cancelToken: source.token })
            .catch(suppressError);
        setSubmitting(false);
    };

    const stop = async () => {
        setSubmitting(true);
        source.cancel('Canceled by user.');
        source = CancelToken.source();
        await axios.get('/api/stop');
        setSubmitting(false);
    };

    const handleKeyPress = e => {
        if (e.repeat) {
            return;
        }
        if (submitting) {
            return;
        }
        if (e.keyCode === 37) {
            moveMotor('backward');
        } else if (e.keyCode === 39) {
            moveMotor('forward');
        }
    };
    useEffect(() => {
        document.addEventListener('keyup', handleKeyPress);
        return () => {
            document.removeEventListener('keyup', handleKeyPress);
        };
    }, []);

    return (
        <div className={styles.calibration}>
            <div className={styles.calibrationRow}>
                <button
                    className={styles.button}
                    onClick={() => moveMotor('backward')}
                    id="backward"
                    disabled={submitting}
                >
                    <Arrow width="70" />
                </button>
                <div className={styles.image}>
                    <img src={motor} />
                </div>
                <button
                    className={styles.button}
                    id="forward"
                    disabled={submitting}
                    onClick={() => moveMotor('forward')}
                >
                    <Arrow width="70" rotate="180" />
                </button>
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="">Steps</label>
                <input
                    type="number"
                    value={steps}
                    onChange={e => setSteps(e.target.value)}
                    className={styles.input}
                />
            </div>
            <button className={styles.autoButtons} disabled={submitting} onClick={deployMovement}>
                Deployment movement
            </button>
            <button className={styles.autoButtons} onClick={stop}>
                STOP!
            </button>
        </div>
    );
};

export default Controller;
