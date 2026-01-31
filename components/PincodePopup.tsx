import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PincodePopupProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (houseNumber: string, pincode: string) => void;
}

const PincodePopup: React.FC<PincodePopupProps> = ({ visible, onClose, onSubmit }) => {
    const [houseNumber, setHouseNumber] = useState('');
    const [pincode, setPincode] = useState('');
    const [isHouseNumberSet, setIsHouseNumberSet] = useState(false);
    const { t } = useTranslation();

    const handleDigitPress = (digit: string) => {
        if (!isHouseNumberSet) {
            setHouseNumber(houseNumber + digit);
        } else {
            if (pincode.length < 4) {
                setPincode(pincode + digit);
            }
        }
    };

    const handleBackPress = () => {
        if (!isHouseNumberSet) {
            setHouseNumber(houseNumber.slice(0, -1));
        } else {
            setPincode(pincode.slice(0, -1));
        }
    };

    const handleOkPress = () => {
        if (!isHouseNumberSet) {
            if (houseNumber.trim() !== '') {
                setIsHouseNumberSet(true);
            } else {
                alert(t('pincode.pleaseEnterHouse'));
            }
        } else {
            if (pincode.length === 4) {
                onSubmit(houseNumber, pincode);
                resetState();
                onClose();
            } else {
                alert(t('pincode.pinMustBe4'));
            }
        }
    };

    const resetState = () => {
        setHouseNumber('');
        setPincode('');
        setIsHouseNumberSet(false);
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    {!isHouseNumberSet ? (
                        <>
                            <Text>{t('pincode.enterHouseNumber')}</Text>
                            <View style={styles.pincodeContainer}>
                                {Array.from({ length: 9 }, (_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.button}
                                        onPress={() => handleDigitPress((i + 1).toString())}
                                    >
                                        <Text style={styles.buttonText}>{(i + 1).toString()}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => handleBackPress()}
                                >
                                    <Text style={styles.buttonText}>←</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => handleDigitPress("0")}
                                >
                                    <Text style={styles.buttonText}>0</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleOkPress}
                                >
                                    <Text style={styles.buttonText}>OK</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.input}
                                value={houseNumber}
                                editable={false}
                            />
                        </>
                    ) : (
                        <>
                            <Text>{t('pincode.enterPincode')}</Text>
                            <View style={styles.pincodeContainer}>
                                {Array.from({ length: 9 }, (_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.button}
                                        onPress={() => handleDigitPress((i + 1).toString())}
                                    >
                                        <Text style={styles.buttonText}>{(i + 1).toString()}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => handleBackPress()}
                                >
                                    <Text style={styles.buttonText}>←</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => handleDigitPress("0")}
                                >
                                    <Text style={styles.buttonText}>0</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleOkPress}
                                >
                                    <Text style={styles.buttonText}>OK</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.input}
                                value={pincode}
                                editable={false}
                            />
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    input: {
        width: 100,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        textAlign: 'center',
    },
    pincodeContainer: {
        width: 200,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    button: {
        width: 50,
        height: 50,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PincodePopup;
