import PropTypes from 'prop-types';
import '../styles/TimerButton.css';

export default function TimerButton({ isRunning, onClick, disabled }) {
  const buttonText = isRunning ? 'Stop' : 'Start';
  const ariaLabel = isRunning ? 'Stop the timer' : 'Start the timer';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`timer-button ${isRunning ? 'running' : 'stopped'} ${disabled ? 'disabled' : ''}`}
      aria-label={ariaLabel}
    >
      {buttonText}
    </button>
  );
}

TimerButton.propTypes = {
  isRunning: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};
