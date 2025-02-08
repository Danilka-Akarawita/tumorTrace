def train_model(model, train_data, valid_data, epochs=5):
    history = model.fit(train_data, epochs=epochs, validation_data=valid_data, shuffle=False)
    return history