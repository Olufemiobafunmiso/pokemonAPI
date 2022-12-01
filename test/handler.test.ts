import app from '../src/app';
import { pokemonApiMock } from './mocks';
import * as handler from "../src/handlers";
import { NotFoundError } from '../src/common/error';


describe("Handler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should return status code 400 if name is numeric', async () => {
    const request = await app.inject({
      url: '/poke/4'
    })

    const response = JSON.parse(request.payload)
    expect(request.statusCode).toEqual(400);
    expect(response).toMatchObject({ message: 'name is required and cannot be a number', success: false });
  })
  test('should return status code 500 third party api return error', async () => {
    jest.spyOn(handler, 'makeApiCall').mockResolvedValue({ errorCode: 502, errMsg: "Bad Gateway." })
    const request = await app.inject({
      url: '/poke/fe'
    })
    const response = JSON.parse(request.payload)
    expect(request.statusCode).toEqual(500);
    expect(response).toMatchObject({ message: 'An error occurred, admin fixing 🛠', success: false });
  })


  test('should return status code 404 when name is not found', async () => {
    jest.spyOn(handler, 'makeApiCall').mockImplementation(()=> {
      throw new NotFoundError('Not Found')
    })
    const request = await app.inject({
      url: '/poke/fe'
    })
 
    const response = JSON.parse(request.payload)
    expect(request.statusCode).toEqual(404);
    expect(response).toMatchObject({ message: 'Not Found', success: false });
  })




  test('should return status code 200', async () => {
    jest.spyOn(handler, 'makeApiCall').mockResolvedValue(pokemonApiMock);
    const request = await app.inject({
      url: '/poke/spearow'
    })
    const response = JSON.parse(request.payload)
    expect(request.statusCode).toEqual(200);
    expect(response).toMatchObject({ message: 'Pokemon successfully fetched by name 😎', success: true });
    expect(response.data).toHaveProperty('stats')
    expect(response.data.stats[0]).toHaveProperty('averageStat')
  })



});


