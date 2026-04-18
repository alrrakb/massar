import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import styles from '../ExamCreator.module.css';

interface PublishResultModalProps {
    isOpen: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    examTitle?: string;
    errorMessage?: string;
    onClose: () => void;
}

export function PublishResultModal({
    isOpen,
    isLoading,
    isSuccess,
    examTitle,
    errorMessage,
    onClose,
}: PublishResultModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {isLoading ? (
                    <>
                        <div className={styles.modalIconLoading}>
                            <Loader2 className={styles.spinnerIcon} size={48} />
                        </div>
                        <h3 className={styles.modalTitle}>Publishing Exam...</h3>
                        <p className={styles.modalText}>Please wait while we create your exam.</p>
                    </>
                ) : isSuccess ? (
                    <>
                        <div className={styles.modalIconSuccess}>
                            <CheckCircle size={48} />
                        </div>
                        <h3 className={styles.modalTitle}>Exam Published!</h3>
                        <p className={styles.modalText}>
                            <strong>"{examTitle}"</strong> has been published successfully.
                        </p>
                        <p className={styles.modalSubtext}>
                            Students can now access the exam according to your configured schedule.
                        </p>
                        <button onClick={onClose} className={`${styles.btn} ${styles.btnSuccess}`}>
                            OK
                        </button>
                    </>
                ) : (
                    <>
                        <div className={styles.modalIconError}>
                            <XCircle size={48} />
                        </div>
                        <h3 className={styles.modalTitle}>Publishing Failed</h3>
                        <p className={styles.modalText}>{errorMessage || 'An unexpected error occurred.'}</p>
                        <p className={styles.modalSubtext}>Please try again or contact support if the problem persists.</p>
                        <button onClick={onClose} className={`${styles.btn} ${styles.btnOutline}`}>
                            OK
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default PublishResultModal;
