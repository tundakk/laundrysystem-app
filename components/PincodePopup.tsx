import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';

interface PincodePopupProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (houseNumber: string, pincode: string) => void;
}

const PincodePopup: React.FC<PincodePopupProps> = ({ visible, onClose, onSubmit }) => {
    const [houseNumber, setHouseNumber] = useState('');
    const [pincode, setPincode] = useState('');
    const [isHouseNumberSet, setIsHouseNumberSet] = useState(false);

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
            setHouseNumber(houseNumber.slice(0, -1)); // Remove the last digit from the house number
        } else {
            setPincode(pincode.slice(0, -1)); // Remove the last digit from the pincode
        }
    };

    const handleOkPress = () => {
        if (!isHouseNumberSet) {
            if (houseNumber.trim() !== '') {
                setIsHouseNumberSet(true); // Proceed to PIN code input
            } else {
                alert('Please enter a house number');
            }
        } else {
            if (pincode.length === 4) {
                onSubmit(houseNumber, pincode);
                resetState();
                onClose();
            } else {
                alert('Pincode must be 4 digits');
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
                            <Text>Enter House Number</Text>
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
                            <Text>Enter Pincode</Text>
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
